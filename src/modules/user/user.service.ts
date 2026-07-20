import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    // Create User
    async create(userData: DeepPartial<User>): Promise<User>{
        const user = this.userRepository.create(userData);

        return await this.userRepository.save(user)
    }

    // Find User By ID
    async findById(id: string): Promise<User | null>{
        return await this.userRepository.findOne({
            where: { id },
            relations: {
                roles: true
            }
        })
    }

    // Find User By Email
    async findByEmail(email: string): Promise<User | null>{
        return await this.userRepository.findOne({
            where: { email },
            relations: {
                roles: true
            }
        });
    }

    // Find By Email Include Password Field
    async findByEmailWithPassword(email: string): Promise<User | null>{
        return await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .leftJoinAndSelect('user.roles', 'role')
            .where('user.email = :email', {email})
            .getOne()
    }

    // Update Login Date
    async updateLastLogin(id: string): Promise<void>{
        await this.userRepository.update(id, {
            lastLoginAt: new Date()
        })
    }
}
