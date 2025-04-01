import { Controller, Patch, UseGuards, Param, Body, ParseIntPipe, Post } from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { Message } from "twilio/lib/twiml/MessagingResponse";
import { BaseResponseDto } from "src/dtos/base-reposnse.dto";

@Controller("auth/admin")
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post("signup")
  async signupAdmin(@Body() dto: CreateAdminDto): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.signupAdmin(dto);

      return {
        message: "Admin craeted successfully",
        data: {
          accessToken: result.token,
          refreshToken: null,
          user: result.newAdmin,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  @Roles(Role.ADMIN) // Set meta data
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("serviceProviders/:spId/status")
  async updateStatus(
    @Param("spId", ParseIntPipe) id: number,
    @Body() data: UpdateStatusDto ): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.updateServiceProviderStatus( id, data.status );

      return {
        message: `Service Provider status updated to ${data.status} successfully `,
      };
    } catch (err) {
      throw err;
    }
  }

  @Patch("serviceProviders/:spId/services/:sId/status")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateServiceStatus(
    @Param("spId", ParseIntPipe) spId: number,
    @Param("sId", ParseIntPipe) sId: number,
    @Body() data: UpdateStatusDto ): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.updateServiceStatus( spId, sId, data.status );

      return {
        message: `Service status updated to ${data.status} successfully `,
      };
    } catch (err) {
      throw err;
    }
  }
}
