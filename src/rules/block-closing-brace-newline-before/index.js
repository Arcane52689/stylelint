import {
  cssStatementBlockString,
  cssStatementHasBlock,
  cssStatementHasEmptyBlock,
  isSingleLineString,
  report,
  ruleMessages,
  validateOptions
} from "../../utils"

export const ruleName = "block-closing-brace-newline-before"

export const messages = ruleMessages(ruleName, {
  expectedBefore: () => `Expected newline before "}"`,
  expectedBeforeMultiLine: () => `Expected newline before "}" of a multi-line block`,
  rejectedBeforeMultiLine: () => `Unexpected whitespace before "}" of a multi-line block`,
})

/**
 * @param {"always"|"always-multi-line"|"never-multi-line"} expectation
 */
export default function (expectation) {
  return (root, result) => {
    validateOptions({ result, ruleName,
      actual: expectation,
      possible: [
        "always",
        "always-multi-line",
        "never-multi-line",
      ],
    })

    // Check both kinds of statements: rules and at-rules
    root.eachRule(check)
    root.eachAtRule(check)

    function check(statement) {

      // Return early if blockless or has empty block
      if (!cssStatementHasBlock(statement) || cssStatementHasEmptyBlock(statement)) { return }

      const blockIsMultiLine = !isSingleLineString(cssStatementBlockString(statement))

      // We're really just checking whether a
      // newline *starts* the block's final space -- between
      // the last declaration and the closing brace. We can
      // ignore any other whitespace between them, because that
      // will be checked by the indentation rule.
      if (statement.after[0] !== "\n" && statement.after.substr(0, 2) !== "\r\n") {
        if (expectation === "always") {
          report({
            message: messages.expectedBefore(),
            node: statement,
            result,
            ruleName,
          })
        } else if (blockIsMultiLine && expectation === "always-multi-line") {
          report({
            message: messages.expectedBeforeMultiLine(),
            node: statement,
            result,
            ruleName,
          })
        }
      }
      if (statement.after) {
        if (expectation === "never") {
          report({
            message: messages.rejectedBefore(),
            node: statement,
            result,
            ruleName,
          })
        } else if (blockIsMultiLine && expectation === "never-multi-line") {
          report({
            message: messages.rejectedBeforeMultiLine(),
            node: statement,
            result,
            ruleName,
          })
        }
      }
    }
  }
}
