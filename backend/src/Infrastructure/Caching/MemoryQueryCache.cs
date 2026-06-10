using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using PainelObrigacoes.Application.Common;

namespace PainelObrigacoes.Infrastructure.Caching;

public sealed class MemoryQueryCache(IMemoryCache memoryCache) : IQueryCache
{
    private static readonly TimeSpan MinimumDuration = TimeSpan.FromSeconds(1);
    private readonly ConcurrentDictionary<string, byte> _keys = new();

    public async Task<T> GetOrCreateAsync<T>(
        string key,
        TimeSpan duration,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken cancellationToken)
    {
        if (memoryCache.TryGetValue<T>(key, out var cached))
        {
            return cached!;
        }

        var value = await factory(cancellationToken);
        var options = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = duration > TimeSpan.Zero ? duration : MinimumDuration
        };

        options.RegisterPostEvictionCallback((evictedKey, _, _, _) =>
        {
            if (evictedKey is string stringKey)
            {
                _keys.TryRemove(stringKey, out _);
            }
        });

        memoryCache.Set(key, value, options);
        _keys.TryAdd(key, 0);
        return value;
    }

    public void RemoveByPrefix(string prefix)
    {
        foreach (var key in _keys.Keys.Where(key => key.StartsWith(prefix, StringComparison.Ordinal)))
        {
            memoryCache.Remove(key);
            _keys.TryRemove(key, out _);
        }
    }
}
