import { Controller, Patch, UseGuards, Param, Body, ParseIntPipe, Post, Get } from "@nestjs/common";
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

  // change the state of a service provider
  @Roles(Role.ADMIN) // Set meta data
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("service-providers/:spId/status")
  async updateProviderStatus(
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

  // change the state of a service
  @Patch("service-providers/:spId/services/:sId/status")
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

  // get pending service providers
  @Get('service-providers/status/pending')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPendingProviders(): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.getPendingProviders();

      if (result.length === 0) {
        return {
          message: 'No pending service providers found.',
          data: [],
        };
      }  

      return {
        message: 'Pending service providers fetched successfully.',
        data: result,
      };
    } catch (err) {
      throw err
    }
  }

  // get Fetch providers with pending services
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('service-providers/services/status/pending')
  async getServiceProvidersWithPendingServices(): Promise<BaseResponseDto> {
    try {
      const result = await this.adminService.getProvidersPendingServices();

      if (result.length === 0) {
        return {
          message: 'No pending services found.',
          data: [],
        };
      }  

      return {
        message: 'Service providers with pending services fetched successfully.',
        data: result,
      };
    } catch (err) {
      throw err;
    }
  }

}