const injectStyle = (style) => {
  const styleElement = document.createElement('style')
  let styleSheet = null as CSSStyleSheet | null

  document.head.appendChild(styleElement)

  styleSheet = styleElement.sheet

  if (styleSheet) {
    styleSheet.insertRule(style, styleSheet.cssRules.length)
  }
}

export default injectStyle
