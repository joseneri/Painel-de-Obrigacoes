using PainelObrigacoes.Application.Common;

namespace PainelObrigacoes.Application.Tests;

internal sealed class FakeQueryCache : IQueryCache
{
    private readonly Dictionary<string, object?> _cache = [];

    public int FactoryCalls { get; private set; }

    public async Task<T> GetOrCreateAsync<T>(
        string key,
        TimeSpan duration,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue(key, out var cached))
        {
            return (T)cached!;
        }

        FactoryCalls++;
        var value = await factory(cancellationToken);
        _cache[key] = value;
        return value;
    }

    public void RemoveByPrefix(string prefix)
    {
        foreach (var key in _cache.Keys.Where(key => key.StartsWith(prefix, StringComparison.Ordinal)).ToArray())
        {
            _cache.Remove(key);
        }
    }
}
