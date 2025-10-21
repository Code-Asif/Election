import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ElectionsModule } from './elections/elections.module';
import { CandidatesModule } from './candidates/candidates.module';
import { VotesModule } from './votes/votes.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { EmailModule } from './email/email.module';
import { QrModule } from './qr/qr.module';
import { VotesGateway } from './gateways/votes.gateway';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/election_system'),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ElectionsModule,
    CandidatesModule,
    VotesModule,
    AuditLogsModule,
    EmailModule,
    QrModule,
  ],
  controllers: [AppController],
  providers: [AppService, VotesGateway],
})
export class AppModule {}
