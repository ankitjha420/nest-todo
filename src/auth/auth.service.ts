import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { UsersRepository } from './users.repository'
import { AuthCredentialsDto } from './dto/auth-credentials.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './user.entity'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from './jwt-payload.interface'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: UsersRepository,
        private readonly jwtService: JwtService,
    ) {
    }

    async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto
        const user = this.usersRepository.create({ username, password })

        // hashing ->
        const salt: string = await bcrypt.genSalt()
        user.password = await bcrypt.hash(password, salt)

        try {
            await this.usersRepository.save(user)
        } catch (error) {
            if (error.code === '23505') { // duplicate username in db
                throw new ConflictException('Username already exists')
            } else {
                throw new InternalServerErrorException()
            }
        }
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return await this.createUser(authCredentialsDto)
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const { username, password } = authCredentialsDto
        const user = await this.usersRepository.findOne({ where: { username } })

        if (user && (await bcrypt.compare(password, user.password))) {
            const payload: JwtPayload = { username }
            const accessToken: string = this.jwtService.sign(payload)
            return { accessToken }
        } else {
            throw new UnauthorizedException('incorrect login details')
        }
    }
}
