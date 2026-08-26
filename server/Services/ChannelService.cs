using server;

public class ChannelService
{
    private readonly AppDbContext _context;

    public ChannelService(AppDbContext context) => _context = context;

    public async Task CreateDirectChannelAsync(string userId1, string userId2)
    {
        var channel = new Channel
        {
            Type = ChannelType.DIRECT,
        };
        channel.Participants.Add(new ChannelParticipant { UserId = userId1 });
        channel.Participants.Add(new ChannelParticipant { UserId = userId2 });

        _context.Channels.Add(channel);
        await _context.SaveChangesAsync();
    }
}