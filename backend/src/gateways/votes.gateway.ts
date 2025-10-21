import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { VotesService } from '../votes/votes.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class VotesGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('VotesGateway');

  constructor(private votesService: VotesService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_election')
  handleJoinElection(@MessageBody() data: { electionId: string }, @ConnectedSocket() client: Socket) {
    const { electionId } = data;
    client.join(`election_${electionId}`);
    this.logger.log(`Client ${client.id} joined election ${electionId}`);
  }

  @SubscribeMessage('leave_election')
  handleLeaveElection(@MessageBody() data: { electionId: string }, @ConnectedSocket() client: Socket) {
    const { electionId } = data;
    client.leave(`election_${electionId}`);
    this.logger.log(`Client ${client.id} left election ${electionId}`);
  }

  // Method to broadcast vote updates to all clients in an election room
  async broadcastVoteUpdate(electionId: string) {
    try {
      const results = await this.votesService.getVoteResults(electionId);
      this.server.to(`election_${electionId}`).emit('vote_update', results);
      this.logger.log(`Broadcasted vote update for election ${electionId}`);
    } catch (error) {
      this.logger.error(`Error broadcasting vote update for election ${electionId}:`, error);
    }
  }

  // Method to broadcast election status changes
  broadcastElectionStatus(electionId: string, status: string) {
    this.server.to(`election_${electionId}`).emit('election_status_change', {
      electionId,
      status,
      timestamp: new Date(),
    });
    this.logger.log(`Broadcasted election status change for election ${electionId}: ${status}`);
  }

  // Method to broadcast election start/end
  broadcastElectionEvent(electionId: string, event: string, data?: any) {
    this.server.to(`election_${electionId}`).emit('election_event', {
      electionId,
      event,
      data,
      timestamp: new Date(),
    });
    this.logger.log(`Broadcasted election event for election ${electionId}: ${event}`);
  }
}
