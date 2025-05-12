import { Body, Controller, Post, Get, Req, UseGuards } from "@nestjs/common";
import { sendOtpDto } from "./dtos/send-otp.dto";
import { AuthService } from "./auth.service";
import { BaseResponseDto } from "src/dtos/base-reposnse.dto";
import { Request } from "express";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { signinDto } from "./dtos/signIn.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from "@nestjs/swagger";

@ApiTags('auth')
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Get user status', description: 'Returns the current authenticated user information' })
  @ApiResponse({ 
    status: 200, 
    description: 'User information returned successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'user-uuid' },
        username: { type: 'string', example: 'username' },
        phoneNumber: { type: 'string', example: '+123456789' },
        role: { type: 'string', example: 'CUSTOMER | SERVICE_PROVIDER | WORKER' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  @Get("status")
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({ summary: 'Send OTP', description: 'Sends an OTP code to the provided phone number' })
  @ApiBody({ type: sendOtpDto })
  @ApiResponse({ 
    status: 201, 
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'OTP sent successfully'
        },
        data: {
          type: 'object',
          example: {}
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post("/sendOtp")
  async sendOtp(@Body() body: sendOtpDto): Promise<BaseResponseDto> {
    const phoneNumber = body.phoneNumber;

    try {
      const result = await this.authService.sendOtp(phoneNumber);

      return {
        message: "OTP sent successfully",
        data: {},
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Sign in', description: 'Signs in a user with phone number and OTP code' })
  @ApiBody({ type: signinDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Signed in successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Signed in successfully'
        },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              example: null
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user-uuid' },
                username: { type: 'string', example: 'username' },
                phoneNumber: { type: 'string', example: '+123456789' },
                role: { type: 'string', example: 'CUSTOMER | SERVICE_PROVIDER | WORKER' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Wrong OTP' })
  @ApiResponse({ status: 403, description: 'Forbidden - Account is blacklisted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post("/signin")
  async signIn(@Body() body: signinDto): Promise<BaseResponseDto> {
    const { phoneNumber, otpCode } = body;

    try {
      const result = await this.authService.signin(phoneNumber, otpCode);
      
      return {
        message: "Signed in successfully ",
        data: {
          accessToken: result.token,
          refreshToken: null,
          user: result.user,
        },
      };
    } catch (err) {
      throw err;
    }
  }
}
