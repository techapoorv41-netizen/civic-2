
class AiProvider {
  // -> { severityScore, predictedCategory, duplicateIssueIds, reasoning }
  async analyzeIssue() {
    throw new Error('analyzeIssue not implemented');
  }
  // -> string
  async chat() {
    throw new Error('chat not implemented');
  }
}

module.exports = AiProvider;