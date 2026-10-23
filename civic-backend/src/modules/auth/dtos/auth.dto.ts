export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "citizen" | "official";
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshDTO {
  refreshToken: string;
}

export interface LogoutDTO {
  refreshToken?: string;
}

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isBlocked: boolean;
  isVerified?: boolean;
  department?: string;
  designation?: string;
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDTO {
  user: AuthUserDTO;
  accessToken: string;
  refreshToken: string;
}
