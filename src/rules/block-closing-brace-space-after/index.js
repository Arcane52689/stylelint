import {
  cssStatementBlockString,
  cssStatementHasBlock,
  report,
  ruleMessages,
  validateOptions,
  whitespaceChecker
} from "../../utils"

export const ruleName = "block-closing-brace-space-after"

export const messages = ruleMessages(ruleName, {
  expectedAfter: () => `Expected single space after "}"`,
  rejectedAfter: () => `Unexpected whitespace after "}"`,
  expectedAfterSingleLine: () => `Expected single space after "}" of a single-line block`,
  rejectedAfterSingleLine: () => `Unexpected whitespace after "}" of a single-line block`,
  expectedAfterMultiLine: () => `Expected single space after "}" of a multi-line block`,
  rejectedAfterMultiLine: () => `Unexpected whitespace after "}" of a multi-line block`,
})

/**
 * @param {"always"|"never"|"always-single-line"|"never-single-line"|"always-multi-line"|"never-multi-line"} expectation
 */
export default function (expectation) {
  const checker = whitespaceChecker("space", expectation, messages)
  return function (root, result) {
    validateOptions({ result, ruleName,
      actual: expectation,
      possible: [
        "always",
        "never",
        "always-single-line",
        "never-single-line",
        "always-multi-line",
        "never-multi-line",
      ],
    })

    // Check both kinds of statements: rules and at-rules
    root.eachRule(check)
    root.eachAtRule(check)

    function check(statement) {
      const nextNode = statement.next()
      if (!nextNode) { return }
      if (!cssStatementHasBlock(statement)) { return }

      checker.after({
        source: nextNode.toString(),
        index: -1,
        lineCheckStr: cssStatementBlockString(statement),
        err: msg => {
          report({
            message: msg,
            node: statement,
            result,
            ruleName,
          })
        },
      })
    }
  }
}
