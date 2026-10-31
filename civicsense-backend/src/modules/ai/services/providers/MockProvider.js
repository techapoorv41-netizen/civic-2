const AiProvider = require('./AiProvider');

class MockProvider extends AiProvider {
  async analyzeIssue({ categories }) {
    return {
      severityScore: 5,
      predictedCategory: categories && categories[0] ? categories[0] : null,
      duplicateIssueIds: [],
      reasoning: 'MOCK analysis - real AI nahi chal raha',
      _mock: true,
    };
  }

  async chat() {
    return 'MOCK reply: real AI mode off hai.';
  }
}

module.exports = MockProvider;