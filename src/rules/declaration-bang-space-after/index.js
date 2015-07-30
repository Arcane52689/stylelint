import {
  report,
  ruleMessages,
  validateOptions,
  whitespaceChecker
} from "../../utils"

export const ruleName = "declaration-bang-space-after"

export const messages = ruleMessages(ruleName, {
  expectedAfter: () => `Expected single space after "!"`,
  rejectedAfter: () => `Unexpected whitespace after "!"`,
})

/**
 * @param {"always"|"never"} expectation
 */
export default function (expectation) {
  const checker = whitespaceChecker("space", expectation, messages)
  return (root, result) => {
    validateOptions({ result, ruleName,
      actual: expectation,
      possible: [
        "always",
        "never",
      ],
    })

    declarationBangSpaceChecker(checker.after, root, result)
  }
}

export function declarationBangSpaceChecker(locationChecker, root, result) {
  root.eachDecl(function (decl) {
    if (!decl.important) { return }
    const declString = decl.toString()

    // Start from the right and only pay attention to the first
    // exclamation mark found
    for (let i = declString.length - 1; i >= 0; i--) {
      if (declString[i] !== "!") { continue }
      check(declString, i, decl)
      break
    }
  })

  function check(source, index, node) {
    locationChecker({ source, index, err: m =>
      report({
        message: m,
        node: node,
        result,
        ruleName,
      }),
    })
  }
}
