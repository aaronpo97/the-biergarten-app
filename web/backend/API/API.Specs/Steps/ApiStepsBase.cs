using Reqnroll;

namespace API.Specs.Steps;

/// <summary>
///     Shared <see cref="TestApiFactory" />/<see cref="HttpClient" /> plumbing and the <see cref="ScenarioContext" />
///     keys used to coordinate it, common to every step definition class that drives the test API.
/// </summary>
public abstract class ApiStepsBase(ScenarioContext scenario)
{
    protected ScenarioContext Scenario { get; } = scenario;

    protected const string ClientKey = "client";
    protected const string FactoryKey = "factory";
    protected const string ResponseKey = "response";
    protected const string ResponseBodyKey = "responseBody";

    internal TestApiFactory GetFactory()
    {
        TestApiFactory? factory = Scenario.TryGetValue<TestApiFactory>(
            FactoryKey,
            out TestApiFactory? f
        )
            ? f
            : new TestApiFactory();
        Scenario[FactoryKey] = factory;
        return factory;
    }

    protected HttpClient GetClient()
    {
        if (Scenario.TryGetValue<HttpClient>(ClientKey, out HttpClient? client))
            return client;

        client = GetFactory().CreateClient();
        Scenario[ClientKey] = client;
        return client;
    }
}
