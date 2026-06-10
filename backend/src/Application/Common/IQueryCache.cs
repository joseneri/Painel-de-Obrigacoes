namespace PainelObrigacoes.Application.Common;

public interface IQueryCache
{
    Task<T> GetOrCreateAsync<T>(
        string key,
        TimeSpan duration,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken cancellationToken);

    void RemoveByPrefix(string prefix);
}
