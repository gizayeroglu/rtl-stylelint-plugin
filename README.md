# Stylelint Plugin Logical Properties

A Stylelint plugin to convert physical CSS properties to logical properties.


## Usage

```bash
yarn add @discovery/stylelint-plugin-logical-properties --dev
```


add `.stylelintrc` file in your project root path
```json
{
  "plugins": [
    "@discovery/stylelint-plugin-logical-properties"
  ],
  "rules": {
    "logical-properties/convert-to-logical": true
  }
}
```
add script to run stylelint
```
  "lint:css": "stylelint '**/*.{css,scss,less}'",
```

to see required changes in terminal run:
```bash
yarn lint:css
```

to fix required changes automatically run:
```bash
yarn lint:css --fix
```
