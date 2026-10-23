import RefreshToken, { IRefreshToken } from "../entities/RefreshToken.entity";
import { Types } from "mongoose";

export class AuthRepository {
  static async createToken(data: {
    userId: Types.ObjectId | string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string | null;
  }): Promise<IRefreshToken> {
    return await RefreshToken.create(data);
  }

  static async findTokenByHash(tokenHash: string): Promise<IRefreshToken | null> {
    return await RefreshToken.findOne({ tokenHash });
  }

  static async revokeToken(tokenId: Types.ObjectId | string, replacedBy?: string): Promise<IRefreshToken | null> {
    return await RefreshToken.findByIdAndUpdate(
      tokenId,
      {
        $set: {
          revokedAt: new Date(),
          ...(replacedBy ? { replacedBy } : {}),
        },
      },
      { new: true }
    );
  }

  static async revokeAllForUser(userId: Types.ObjectId | string): Promise<number> {
    const result = await RefreshToken.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
    return result.modifiedCount;
  }

  static async deleteExpired(): Promise<number> {
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  }
}

export default AuthRepository;
