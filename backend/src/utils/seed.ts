import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (be careful in production!)
    await prisma.notification.deleteMany();
    await prisma.match.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'john@example.com',
          password: hashedPassword,
          name: 'John Smith',
          region: 'North District',
          phone: '+1234567890'
        }
      }),
      prisma.user.create({
        data: {
          email: 'sarah@example.com',
          password: hashedPassword,
          name: 'Sarah Johnson',
          region: 'South District',
          phone: '+1234567891'
        }
      }),
      prisma.user.create({
        data: {
          email: 'mike@example.com',
          password: hashedPassword,
          name: 'Mike Wilson',
          region: 'East District',
          phone: '+1234567892'
        }
      }),
      prisma.user.create({
        data: {
          email: 'emma@example.com',
          password: hashedPassword,
          name: 'Emma Davis',
          region: 'West District',
          phone: '+1234567893'
        }
      }),
      prisma.user.create({
        data: {
          email: 'alex@example.com',
          password: hashedPassword,
          name: 'Alex Brown',
          region: 'Central District',
          phone: '+1234567894'
        }
      })
    ]);

    console.log('👥 Created users');

    // Create teams
    const teams = await Promise.all([
      prisma.team.create({
        data: {
          name: 'Thunder Bolts FC',
          sport: 'Football',
          region: 'North District',
          description: 'Competitive football team looking for challenging matches',
          maxPlayers: 20,
          contactEmail: 'thunderbolts@example.com',
          contactPhone: '+1234567890',
          ownerId: users[0].id,
          wins: 8,
          losses: 3,
          draws: 1,
          rating: 1650,
          matchesPlayed: 12
        }
      }),
      prisma.team.create({
        data: {
          name: 'Lightning Strikers',
          sport: 'Football',
          region: 'North District',
          description: 'Fast-paced attacking football team',
          maxPlayers: 18,
          contactEmail: 'lightning@example.com',
          contactPhone: '+1234567891',
          ownerId: users[1].id,
          wins: 6,
          losses: 4,
          draws: 2,
          rating: 1580,
          matchesPlayed: 12
        }
      }),
      prisma.team.create({
        data: {
          name: 'City Champions',
          sport: 'Football',
          region: 'South District',
          description: 'Championship-winning football squad',
          maxPlayers: 22,
          contactEmail: 'champions@example.com',
          contactPhone: '+1234567892',
          ownerId: users[2].id,
          wins: 15,
          losses: 2,
          draws: 1,
          rating: 1850,
          matchesPlayed: 18
        }
      }),
      prisma.team.create({
        data: {
          name: 'Riverside United',
          sport: 'Football',
          region: 'East District',
          description: 'United we stand, divided we fall',
          maxPlayers: 20,
          contactEmail: 'riverside@example.com',
          contactPhone: '+1234567893',
          ownerId: users[3].id,
          wins: 4,
          losses: 8,
          draws: 3,
          rating: 1420,
          matchesPlayed: 15
        }
      }),
      prisma.team.create({
        data: {
          name: 'Mountain Eagles Basketball',
          sport: 'Basketball',
          region: 'West District',
          description: 'Soaring high above the competition',
          maxPlayers: 12,
          contactEmail: 'eagles@example.com',
          contactPhone: '+1234567894',
          ownerId: users[4].id,
          wins: 12,
          losses: 5,
          draws: 0,
          rating: 1720,
          matchesPlayed: 17
        }
      }),
      prisma.team.create({
        data: {
          name: 'Coastal Volleyball Club',
          sport: 'Volleyball',
          region: 'Central District',
          description: 'Beach vibes, competitive spirit',
          maxPlayers: 10,
          contactEmail: 'coastal@example.com',
          contactPhone: '+1234567895',
          ownerId: users[0].id,
          wins: 7,
          losses: 3,
          draws: 2,
          rating: 1620,
          matchesPlayed: 12
        }
      })
    ]);

    console.log('⚽ Created teams');

    // Create team members (owners are automatically members)
    await Promise.all([
      prisma.teamMember.create({
        data: { userId: users[0].id, teamId: teams[0].id, role: 'captain' }
      }),
      prisma.teamMember.create({
        data: { userId: users[1].id, teamId: teams[1].id, role: 'captain' }
      }),
      prisma.teamMember.create({
        data: { userId: users[2].id, teamId: teams[2].id, role: 'captain' }
      }),
      prisma.teamMember.create({
        data: { userId: users[3].id, teamId: teams[3].id, role: 'captain' }
      }),
      prisma.teamMember.create({
        data: { userId: users[4].id, teamId: teams[4].id, role: 'captain' }
      }),
      prisma.teamMember.create({
        data: { userId: users[0].id, teamId: teams[5].id, role: 'captain' }
      })
    ]);

    // Create some challenges
    const challenges = await Promise.all([
      prisma.challenge.create({
        data: {
          fromUserId: users[0].id,
          fromTeamId: teams[0].id,
          toTeamId: teams[1].id,
          sport: 'Football',
          proposedDate: new Date('2025-07-15'),
          proposedTime: '15:00',
          venue: 'Central Sports Complex',
          message: 'Looking forward to a great match!',
          status: 'PENDING'
        }
      }),
      prisma.challenge.create({
        data: {
          fromUserId: users[1].id,
          fromTeamId: teams[1].id,
          toTeamId: teams[2].id,
          sport: 'Football',
          proposedDate: new Date('2025-07-20'),
          proposedTime: '16:30',
          venue: 'South District Stadium',
          message: 'Ready to take on the champions!',
          status: 'PENDING'
        }
      }),
      prisma.challenge.create({
        data: {
          fromUserId: users[2].id,
          fromTeamId: teams[2].id,
          toTeamId: teams[3].id,
          sport: 'Football',
          proposedDate: new Date('2025-07-10'),
          proposedTime: '14:00',
          venue: 'Riverside Park',
          message: 'Time for a classic rivalry match!',
          status: 'ACCEPTED'
        }
      })
    ]);

    console.log('🏆 Created challenges');

    // Create a completed match
    const completedMatch = await prisma.match.create({
      data: {
        challengeId: challenges[2].id,
        homeTeamId: teams[3].id,
        awayTeamId: teams[2].id,
        sport: 'Football',
        date: new Date('2025-07-10'),
        venue: 'Riverside Park',
        homeScore: 1,
        awayScore: 3,
        winnerId: teams[2].id,
        homeRatingChange: -15,
        awayRatingChange: 15,
        status: 'COMPLETED'
      }
    });

    // Update challenge status to completed
    await prisma.challenge.update({
      where: { id: challenges[2].id },
      data: { status: 'COMPLETED' }
    });

    console.log('⚽ Created matches');

    // Create some notifications
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: users[1].id,
          type: 'CHALLENGE_RECEIVED',
          title: 'New Challenge Received',
          message: 'Thunder Bolts FC has challenged your team to a match',
          data: { challengeId: challenges[0].id }
        }
      }),
      prisma.notification.create({
        data: {
          userId: users[2].id,
          type: 'CHALLENGE_RECEIVED',
          title: 'New Challenge Received',
          message: 'Lightning Strikers has challenged your team to a match',
          data: { challengeId: challenges[1].id }
        }
      }),
      prisma.notification.create({
        data: {
          userId: users[3].id,
          type: 'MATCH_COMPLETED',
          title: 'Match Result',
          message: 'Your match against City Champions has been completed',
          data: { matchId: completedMatch.id, result: 'loss' }
        }
      })
    ]);

    console.log('🔔 Created notifications');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`👤 Users: ${users.length}`);
    console.log(`⚽ Teams: ${teams.length}`);
    console.log(`🏆 Challenges: ${challenges.length}`);
    console.log(`⚡ Matches: 1`);
    console.log(`🔔 Notifications: 3`);
    
    console.log('\n🔐 Test credentials:');
    console.log('Email: john@example.com | Password: password123');
    console.log('Email: sarah@example.com | Password: password123');
    console.log('Email: mike@example.com | Password: password123');
    console.log('Email: emma@example.com | Password: password123');
    console.log('Email: alex@example.com | Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🏁 Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
