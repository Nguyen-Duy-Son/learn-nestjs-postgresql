import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { Roles } from '@src/share/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Auth } from '@src/share/decorators/auth.decorator';
import { CreateUserDto } from './dto/request/create-user.dto';
import { AppConstants } from '@src/share/constants';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @Auth(Role.ADMIN) // Gọi Auth và truyền Role
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('get-profile')
  @Auth(Role.USER) // Gọi Auth và truyền Role
  async getProfile(@Req() request: Request) {
    const user = request[AppConstants.Auth.USER_AUTH_KEY]; // Lấy user từ token
    return this.userService.getUserById(user.id); // Lấy thông tin user từ DB
  }

  @Get(':id')
  @Auth(Role.ADMIN) // Gọi Auth và truyền Role
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Patch('update-profile')
  @Auth(Role.USER) // Gọi Auth và truyền Role
  updateProfile(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    const { id } = request[AppConstants.Auth.USER_AUTH_KEY]; // Lấy user từ token
    return this.userService.updateUserById(id, updateUserDto);
  }

  @Patch(':id')
  @Auth(Role.ADMIN) // Gọi Auth và truyền Role
  updateUserById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserById(id, updateUserDto);
  }

  @Delete('delete-profile')
  @Auth(Role.USER) // Gọi Auth và truyền Role
  deleteProfile(@Req() request: Request) {
    const { id } = request[AppConstants.Auth.USER_AUTH_KEY]; // Lấy user từ token
    return this.userService.deleteUserById(id);
  }

  @Delete(':id')
  @Auth(Role.USER) // Gọi Auth và truyền Role
  deleteUserById(@Param('id') id: string) {
    return this.userService.deleteUserById(id);
  }
}
