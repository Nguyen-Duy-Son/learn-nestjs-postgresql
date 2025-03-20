import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { BcryptConfig } from '@src/share/configs/bcrypt.config';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptConfig: BcryptConfig
  ) {}

  async createUser(registerDto: CreateUserDto): Promise<UserEntity> {
    const { email, password } = registerDto;

    // Kiểm tra xem email đã tồn tại chưa
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      throw new BadRequestException('Email đã tồn tại');
    }

    // Hash password
    const newPassword = await this.bcryptConfig.hashPassword(password);

    // Tạo user mới và chỉ trả về các trường cần thiết
    const result = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: newPassword,
      },
    });
    const newUser = plainToInstance(UserEntity, result, { excludeExtraneousValues: true });

    return newUser;
  }

  async getUsers(): Promise<UserEntity[]> {
    try {
      const users = await this.prisma.user.findMany();
      const results = users.map((user) => {
        // convert plain object to instance of UserEntity
        return plainToInstance(UserEntity, user, { excludeExtraneousValues: true });
      });
      return results;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getUserById(id: string) {
    try {
      const checkUser = this.prisma.user.findUnique({ where: { id } });
      if (!checkUser) {
        throw new BadRequestException('User not found');
      }
      const user = plainToInstance(UserEntity, checkUser, { excludeExtraneousValues: true });
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    try {
      const checkUser = this.prisma.user.findUnique({ where: { id } });
      if (!checkUser) {
        throw new BadRequestException('User not found');
      }
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      return plainToInstance(UserEntity, user, { excludeExtraneousValues: true });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteUserById(id: string) {
    try {
      const checkUser = this.prisma.user.findUnique({ where: { id } });
      if (!checkUser) {
        throw new BadRequestException('User not found');
      }
      return this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
