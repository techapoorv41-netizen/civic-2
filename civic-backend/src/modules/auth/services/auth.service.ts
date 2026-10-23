import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../../../config/env";
import AppError from "../../../errors/AppError";
import { ROLES } from "../../../shared/constants/roles";
import AuthRepository from "../repositories/auth.repository";
import UserRepository from "../../users/repositories/user.repository";
import { RegisterDTO, LoginDTO, RefreshDTO, LogoutDTO, AuthResponseDTO, AuthTokensDTO } from "../dtos/auth.dto";
import { toAuthUserDTO } from "../mappers/auth.mapper";
import mongoose from "mongoose";

export class AuthService {
  static hashToken(token: string): string {
    return crypto.createHmac("sha256", env.REFRESH_TOKEN_SECRET).update(token).digest("hex");
  }

  static generateTokenPair(user: any): AuthTokensDTO & { expiresAt: Date } {
    const userId = (user._id || user.id).toString();

    // Access token (15m)
    const accessToken = jwt.sign(
      {
        id: userId,
        sub: userId,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES as any }
    );

    // Refresh token
    const refreshToken = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 864e5);

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  static async register(dto: RegisterDTO, userAgent?: string): Promise<AuthResponseDTO> {
    if ((dto.role as any) === ROLES.ADMIN) {
      throw AppError.validation("Admin role cannot be self-registered", [
        { path: "role", message: "Admin role cannot be self-registered" },
      ]);
    }

    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await UserRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw AppError.conflict("An account with this email address already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await UserRepository.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: dto.phone?.trim() || null,
      role: dto.role || ROLES.CITIZEN,
    });

    const { accessToken, refreshToken, expiresAt } = this.generateTokenPair(user);
    await AuthRepository.createToken({
      userId: user._id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt,
      userAgent: userAgent || null,
    });

    return {
      user: toAuthUserDTO(user),
      accessToken,
      refreshToken,
    };
  }

  static async login(dto: LoginDTO, userAgent?: string): Promise<AuthResponseDTO> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await UserRepository.findByEmailWithPassword(normalizedEmail);

    // Uniform 401 response for either bad email or bad password to prevent enumeration
    if (!user) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is wrong");
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is wrong");
    }

    if (user.isBlocked) {
      throw new AppError(403, "USER_BLOCKED", "Account is blocked");
    }

    await UserRepository.updateById(user._id, { $set: { lastLoginAt: new Date() } });

    let officialProfile: any = null;
    if (user.role === ROLES.OFFICIAL) {
      const OfficialModel = mongoose.models.OfficialProfile;
      if (OfficialModel) {
        officialProfile = await OfficialModel.findOne({ userId: user._id }).lean();
      }
    }

    const { accessToken, refreshToken, expiresAt } = this.generateTokenPair(user);
    await AuthRepository.createToken({
      userId: user._id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt,
      userAgent: userAgent || null,
    });

    return {
      user: toAuthUserDTO(user, officialProfile),
      accessToken,
      refreshToken,
    };
  }

  static async refresh(dto: RefreshDTO, userAgent?: string): Promise<AuthTokensDTO> {
    const tokenHash = this.hashToken(dto.refreshToken);
    const tokenDoc = await AuthRepository.findTokenByHash(tokenHash);

    if (!tokenDoc) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid refresh token");
    }

    // Refresh token reuse detection
    if (tokenDoc.revokedAt) {
      await AuthRepository.revokeAllForUser(tokenDoc.userId);
      throw new AppError(401, "UNAUTHORIZED", "Revoked refresh token reuse detected. All sessions terminated.");
    }

    if (tokenDoc.expiresAt < new Date()) {
      throw new AppError(401, "UNAUTHORIZED", "Refresh token expired");
    }

    const user = await UserRepository.findById(tokenDoc.userId);
    if (!user || user.isBlocked) {
      throw new AppError(401, "UNAUTHORIZED", "User unavailable or blocked");
    }

    const { accessToken, refreshToken: newRefreshToken, expiresAt } = this.generateTokenPair(user);

    // Revoke old token and rotate
    await AuthRepository.revokeToken(tokenDoc._id, this.hashToken(newRefreshToken));
    await AuthRepository.createToken({
      userId: user._id,
      tokenHash: this.hashToken(newRefreshToken),
      expiresAt,
      userAgent: userAgent || null,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(dto: LogoutDTO): Promise<void> {
    if (dto.refreshToken) {
      const tokenHash = this.hashToken(dto.refreshToken);
      const tokenDoc = await AuthRepository.findTokenByHash(tokenHash);
      if (tokenDoc) {
        await AuthRepository.revokeToken(tokenDoc._id);
      }
    }
  }

  static async getMe(userId: string): Promise<any> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "NOT_FOUND", "User not found");
    }

    let officialProfile: any = null;
    if (user.role === ROLES.OFFICIAL) {
      const OfficialModel = mongoose.models.OfficialProfile;
      if (OfficialModel) {
        officialProfile = await OfficialModel.findOne({ userId: user._id }).lean();
      }
    }

    return toAuthUserDTO(user, officialProfile);
  }
}

// CJS interop
(AuthService as any).default = AuthService;
(AuthService as any).AuthService = AuthService;
(AuthService as any).hashToken = AuthService.hashToken;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = AuthService;
}

export default AuthService;
