(function () {
	'use strict';

	function unwrapExports(x) {
	  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
	}

	function createCommonjsModule(fn, module) {
	  return module = {
	    exports: {}
	  }, fn(module, module.exports), module.exports;
	}

	var Parser_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function isNode(x) {
	  return x !== null && typeof x === 'object' && typeof x.type === 'string';
	}

	function forEachChild(node, fn) {
	  let keys = Object.keys(node);
	  let stop = {};
	  for (let i = 0; i < keys.length; ++i) {
	    let key = keys[i];
	    let value = node[key];
	    if (Array.isArray(value)) {
	      for (let j = 0; j < value.length; ++j) {
	        if (isNode(value[j])) if (fn(value[j], key, j, stop) === stop) return;
	      }
	    } else if (isNode(value)) {
	      if (fn(value, key, null, stop) === stop) return;
	    }
	  }
	}

	function Identifier(value, context) {
	  this.type = 'Identifier';
	  this.start = -1;
	  this.end = -1;
	  this.value = value;
	  this.context = context;
	}

	function NumberLiteral(value, suffix) {
	  this.type = 'NumberLiteral';
	  this.start = -1;
	  this.end = -1;
	  this.value = value;
	  this.suffix = suffix;
	}

	function StringLiteral(value) {
	  this.type = 'StringLiteral';
	  this.start = -1;
	  this.end = -1;
	  this.value = value;
	}

	function TemplatePart(value, raw, isEnd) {
	  this.type = 'TemplatePart';
	  this.start = -1;
	  this.end = -1;
	  this.value = value;
	  this.raw = raw;
	  this.templateEnd = isEnd;
	}

	function RegularExpression(value, flags) {
	  this.type = 'RegularExpression';
	  this.start = -1;
	  this.end = -1;
	  this.value = value;
	  this.flags = flags;
	}

	function BooleanLiteral(value) {
	  this.type = 'BooleanLiteral';
	  this.start = -1;
	  this.end = -1;
	  this.value = value;
	}

	function NullLiteral() {
	  this.type = 'NullLiteral';
	  this.start = -1;
	  this.end = -1;
	}

	function Script(statements) {
	  this.type = 'Script';
	  this.start = -1;
	  this.end = -1;
	  this.statements = statements;
	}

	function SymbolName(value) {
	  this.type = 'SymbolName';
	  this.start = -1;
	  this.end = -1;
	  this.value = value;
	}

	function Module(statements) {
	  this.type = 'Module';
	  this.start = -1;
	  this.end = -1;
	  this.statements = statements;
	}

	function ThisExpression() {
	  this.type = 'ThisExpression';
	  this.start = -1;
	  this.end = -1;
	}

	function SuperKeyword() {
	  this.type = 'SuperKeyword';
	  this.start = -1;
	  this.end = -1;
	}

	function SequenceExpression(list) {
	  this.type = 'SequenceExpression';
	  this.start = -1;
	  this.end = -1;
	  this.expressions = list;
	}

	function AssignmentExpression(left, op, right) {
	  this.type = 'AssignmentExpression';
	  this.start = -1;
	  this.end = -1;
	  this.left = left;
	  this.operator = op;
	  this.right = right;
	}

	function SpreadExpression(expr) {
	  this.type = 'SpreadExpression';
	  this.start = -1;
	  this.end = -1;
	  this.expression = expr;
	}

	function YieldExpression(expr, delegate) {
	  this.type = 'YieldExpression';
	  this.start = -1;
	  this.end = -1;
	  this.delegate = delegate;
	  this.expression = expr;
	}

	function ConditionalExpression(test, cons, alt) {
	  this.type = 'ConditionalExpression';
	  this.start = -1;
	  this.end = -1;
	  this.test = test;
	  this.consequent = cons;
	  this.alternate = alt;
	}

	function BinaryExpression(left, op, right) {
	  this.type = 'BinaryExpression';
	  this.start = -1;
	  this.end = -1;
	  this.left = left;
	  this.operator = op;
	  this.right = right;
	}

	function UpdateExpression(op, expr, prefix) {
	  this.type = 'UpdateExpression';
	  this.start = -1;
	  this.end = -1;
	  this.operator = op;
	  this.expression = expr;
	  this.prefix = prefix;
	}

	function UnaryExpression(op, expr) {
	  this.type = 'UnaryExpression';
	  this.start = -1;
	  this.end = -1;
	  this.operator = op;
	  this.expression = expr;
	}

	function MemberExpression(obj, prop) {
	  this.type = 'MemberExpression';
	  this.start = -1;
	  this.end = -1;
	  this.object = obj;
	  this.property = prop;
	}

	function MetaProperty(left, right) {
	  this.type = 'MetaProperty';
	  this.start = -1;
	  this.end = -1;
	  this.left = left;
	  this.right = right;
	}

	function CallExpression(callee, args, trailingComma) {
	  this.type = 'CallExpression';
	  this.start = -1;
	  this.end = -1;
	  this.callee = callee;
	  this.arguments = args;
	  this.trailingComma = trailingComma;
	}

	function CallWithExpression(subject, callee, args, trailingComma) {
	  this.type = 'CallWithExpression';
	  this.start = -1;
	  this.end = -1;
	  this.subject = subject;
	  this.callee = callee;
	  this.arguments = args;
	  this.trailingComma = trailingComma;
	}

	function TemplateExpression(parts) {
	  this.type = 'TemplateExpression';
	  this.start = -1;
	  this.end = -1;
	  this.parts = parts;
	}

	function TaggedTemplateExpression(tag, template) {
	  this.type = 'TaggedTemplateExpression';
	  this.start = -1;
	  this.end = -1;
	  this.tag = tag;
	  this.template = template;
	}

	function NewExpression(callee, args, trailingComma) {
	  this.type = 'NewExpression';
	  this.start = -1;
	  this.end = -1;
	  this.callee = callee;
	  this.arguments = args;
	  this.trailingComma = trailingComma;
	}

	function ParenExpression(expr) {
	  this.type = 'ParenExpression';
	  this.start = -1;
	  this.end = -1;
	  this.expression = expr;
	}

	function ObjectLiteral(props, comma) {
	  this.type = 'ObjectLiteral';
	  this.start = -1;
	  this.end = -1;
	  this.properties = props;
	  this.trailingComma = comma;
	}

	function ComputedPropertyName(expr) {
	  this.type = 'ComputedPropertyName';
	  this.start = -1;
	  this.end = -1;
	  this.expression = expr;
	}

	function PropertyDefinition(name, expr) {
	  this.type = 'PropertyDefinition';
	  this.start = -1;
	  this.end = -1;
	  this.name = name;
	  this.expression = expr;
	}

	function ObjectPattern(props, comma) {
	  this.type = 'ObjectPattern';
	  this.start = -1;
	  this.end = -1;
	  this.properties = props;
	  this.trailingComma = comma;
	}

	function PatternProperty(name, pattern, initializer) {
	  this.type = 'PatternProperty';
	  this.start = -1;
	  this.end = -1;
	  this.name = name;
	  this.pattern = pattern;
	  this.initializer = initializer;
	}

	function ArrayPattern(elements, comma) {
	  this.type = 'ArrayPattern';
	  this.start = -1;
	  this.end = -1;
	  this.elements = elements;
	  this.trailingComma = comma;
	}

	function PatternElement(pattern, initializer) {
	  this.type = 'PatternElement';
	  this.start = -1;
	  this.end = -1;
	  this.pattern = pattern;
	  this.initializer = initializer;
	}

	function PatternRestElement(pattern) {
	  this.type = 'PatternRestElement';
	  this.start = -1;
	  this.end = -1;
	  this.pattern = pattern;
	}

	function MethodDefinition(isStatic, kind, name, params, body) {
	  this.type = 'MethodDefinition';
	  this.start = -1;
	  this.end = -1;
	  this.static = isStatic;
	  this.kind = kind;
	  this.name = name;
	  this.params = params;
	  this.body = body;
	}

	function ArrayLiteral(elements, comma) {
	  this.type = 'ArrayLiteral';
	  this.start = -1;
	  this.end = -1;
	  this.elements = elements;
	  this.trailingComma = comma;
	}

	function Block(statements) {
	  this.type = 'Block';
	  this.start = -1;
	  this.end = -1;
	  this.statements = statements;
	}

	function LabelledStatement(label, statement) {
	  this.type = 'LabelledStatement';
	  this.start = -1;
	  this.end = -1;
	  this.label = label;
	  this.statement = statement;
	}

	function ExpressionStatement(expr) {
	  this.type = 'ExpressionStatement';
	  this.start = -1;
	  this.end = -1;
	  this.expression = expr;
	}

	function Directive(value, expr) {
	  this.type = 'Directive';
	  this.start = -1;
	  this.end = -1;
	  this.value = value;
	  this.expression = expr;
	}

	function EmptyStatement() {
	  this.type = 'EmptyStatement';
	  this.start = -1;
	  this.end = -1;
	}

	function VariableDeclaration(kind, list) {
	  this.type = 'VariableDeclaration';
	  this.start = -1;
	  this.end = -1;
	  this.kind = kind;
	  this.declarations = list;
	}

	function VariableDeclarator(pattern, initializer) {
	  this.type = 'VariableDeclarator';
	  this.start = -1;
	  this.end = -1;
	  this.pattern = pattern;
	  this.initializer = initializer;
	}

	function ReturnStatement(arg) {
	  this.type = 'ReturnStatement';
	  this.start = -1;
	  this.end = -1;
	  this.argument = arg;
	}

	function BreakStatement(label) {
	  this.type = 'BreakStatement';
	  this.start = -1;
	  this.end = -1;
	  this.label = label;
	}

	function ContinueStatement(label) {
	  this.type = 'ContinueStatement';
	  this.start = -1;
	  this.end = -1;
	  this.label = label;
	}

	function ThrowStatement(expr) {
	  this.type = 'ThrowStatement';
	  this.start = -1;
	  this.end = -1;
	  this.expression = expr;
	}

	function DebuggerStatement() {
	  this.type = 'DebuggerStatement';
	  this.start = -1;
	  this.end = -1;
	}

	function IfStatement(test, cons, alt) {
	  this.type = 'IfStatement';
	  this.start = -1;
	  this.end = -1;
	  this.test = test;
	  this.consequent = cons;
	  this.alternate = alt;
	}

	function DoWhileStatement(body, test) {
	  this.type = 'DoWhileStatement';
	  this.start = -1;
	  this.end = -1;
	  this.body = body;
	  this.test = test;
	}

	function WhileStatement(test, body) {
	  this.type = 'WhileStatement';
	  this.start = -1;
	  this.end = -1;
	  this.test = test;
	  this.body = body;
	}

	function ForStatement(initializer, test, update, body) {
	  this.type = 'ForStatement';
	  this.start = -1;
	  this.end = -1;
	  this.initializer = initializer;
	  this.test = test;
	  this.update = update;
	  this.body = body;
	}

	function ForInStatement(left, right, body) {
	  this.type = 'ForInStatement';
	  this.start = -1;
	  this.end = -1;
	  this.left = left;
	  this.right = right;
	  this.body = body;
	}

	function ForOfStatement(async, left, right, body) {
	  this.type = 'ForOfStatement';
	  this.start = -1;
	  this.end = -1;
	  this.async = async;
	  this.left = left;
	  this.right = right;
	  this.body = body;
	}

	function WithStatement(object, body) {
	  this.type = 'WithStatement';
	  this.start = -1;
	  this.end = -1;
	  this.object = object;
	  this.body = body;
	}

	function SwitchStatement(desc, cases) {
	  this.type = 'SwitchStatement';
	  this.start = -1;
	  this.end = -1;
	  this.descriminant = desc;
	  this.cases = cases;
	}

	function SwitchCase(test, cons) {
	  this.type = 'SwitchCase';
	  this.start = -1;
	  this.end = -1;
	  this.test = test;
	  this.consequent = cons;
	}

	function TryStatement(block, handler, fin) {
	  this.type = 'TryStatement';
	  this.start = -1;
	  this.end = -1;
	  this.block = block;
	  this.handler = handler;
	  this.finalizer = fin;
	}

	function CatchClause(param, body) {
	  this.type = 'CatchClause';
	  this.start = -1;
	  this.end = -1;
	  this.param = param;
	  this.body = body;
	}

	function FunctionDeclaration(kind, identifier, params, body) {
	  this.type = 'FunctionDeclaration';
	  this.start = -1;
	  this.end = -1;
	  this.kind = kind;
	  this.identifier = identifier;
	  this.params = params;
	  this.body = body;
	}

	function FunctionExpression(kind, identifier, params, body) {
	  this.type = 'FunctionExpression';
	  this.start = -1;
	  this.end = -1;
	  this.kind = kind;
	  this.identifier = identifier;
	  this.params = params;
	  this.body = body;
	}

	function FormalParameter(pattern, initializer) {
	  this.type = 'FormalParameter';
	  this.start = -1;
	  this.end = -1;
	  this.pattern = pattern;
	  this.initializer = initializer;
	}

	function RestParameter(identifier) {
	  this.type = 'RestParameter';
	  this.start = -1;
	  this.end = -1;
	  this.identifier = identifier;
	}

	function FunctionBody(statements) {
	  this.type = 'FunctionBody';
	  this.start = -1;
	  this.end = -1;
	  this.statements = statements;
	}

	function ArrowFunctionHead(params) {
	  this.type = 'ArrowFunctionHead';
	  this.start = -1;
	  this.end = -1;
	  this.parameters = params;
	}

	function ArrowFunction(kind, params, body) {
	  this.type = 'ArrowFunction';
	  this.start = -1;
	  this.end = -1;
	  this.kind = kind;
	  this.params = params;
	  this.body = body;
	}

	function ClassDeclaration(identifier, base, body) {
	  this.type = 'ClassDeclaration';
	  this.start = -1;
	  this.end = -1;
	  this.identifier = identifier;
	  this.base = base;
	  this.body = body;
	}

	function ClassExpression(identifier, base, body) {
	  this.type = 'ClassExpression';
	  this.start = -1;
	  this.end = -1;
	  this.identifier = identifier;
	  this.base = base;
	  this.body = body;
	}

	function ClassBody(elems) {
	  this.type = 'ClassBody';
	  this.start = -1;
	  this.end = -1;
	  this.elements = elems;
	}

	function EmptyClassElement() {
	  this.type = 'EmptyClassElement';
	  this.start = -1;
	  this.end = -1;
	}

	function ClassField(isStatic, name, initializer) {
	  this.type = 'ClassField';
	  this.start = -1;
	  this.end = -1;
	  this.static = isStatic;
	  this.name = name;
	  this.initializer = initializer;
	}

	function ImportCall(argument) {
	  this.type = 'ImportCall';
	  this.start = -1;
	  this.end = -1;
	  this.argument = argument;
	}

	function ImportDeclaration(imports, from) {
	  this.type = 'ImportDeclaration';
	  this.start = -1;
	  this.end = -1;
	  this.imports = imports;
	  this.from = from;
	}

	function NamespaceImport(identifier) {
	  this.type = 'NamespaceImport';
	  this.start = -1;
	  this.end = -1;
	  this.identifier = identifier;
	}

	function NamedImports(specifiers) {
	  this.type = 'NamedImports';
	  this.start = -1;
	  this.end = -1;
	  this.specifiers = specifiers;
	}

	function DefaultImport(identifier, imports) {
	  this.type = 'DefaultImport';
	  this.start = -1;
	  this.end = -1;
	  this.identifier = identifier;
	  this.imports = imports;
	}

	function ImportSpecifier(imported, local) {
	  this.type = 'ImportSpecifier';
	  this.start = -1;
	  this.end = -1;
	  this.imported = imported;
	  this.local = local;
	}

	function ExportDeclaration(declaration) {
	  this.type = 'ExportDeclaration';
	  this.start = -1;
	  this.end = -1;
	  this.declaration = declaration;
	}

	function ExportDefault(binding) {
	  this.type = 'ExportDefault';
	  this.start = -1;
	  this.end = -1;
	  this.binding = binding;
	}

	function ExportNameList(specifiers, from) {
	  this.type = 'ExportNameList';
	  this.start = -1;
	  this.end = -1;
	  this.specifiers = specifiers;
	  this.from = from;
	}

	function ExportNamespace(identifier, from) {
	  this.type = 'ExportNamespace';
	  this.start = -1;
	  this.end = -1;
	  this.identifier = identifier;
	  this.from = from;
	}

	function ExportDefaultFrom(identifier, from) {
	  this.type = 'ExportDefaultFrom';
	  this.start = -1;
	  this.end = -1;
	  this.identifier = identifier;
	  this.from = from;
	}

	function ExportSpecifier(local, exported) {
	  this.type = 'ExportSpecifier';
	  this.start = -1;
	  this.end = -1;
	  this.local = local;
	  this.exported = exported;
	}

	function Comment(text) {
	  this.type = 'Comment';
	  this.start = -1;
	  this.end = -1;
	  this.text = text;
	}

	function Annotation(expressions) {
	  this.type = 'Annotation';
	  this.start = -1;
	  this.end = -1;
	  this.expressions = expressions;
	}

	var AST = Object.freeze({
	  forEachChild: forEachChild,
	  Identifier: Identifier,
	  NumberLiteral: NumberLiteral,
	  StringLiteral: StringLiteral,
	  TemplatePart: TemplatePart,
	  RegularExpression: RegularExpression,
	  BooleanLiteral: BooleanLiteral,
	  NullLiteral: NullLiteral,
	  Script: Script,
	  SymbolName: SymbolName,
	  Module: Module,
	  ThisExpression: ThisExpression,
	  SuperKeyword: SuperKeyword,
	  SequenceExpression: SequenceExpression,
	  AssignmentExpression: AssignmentExpression,
	  SpreadExpression: SpreadExpression,
	  YieldExpression: YieldExpression,
	  ConditionalExpression: ConditionalExpression,
	  BinaryExpression: BinaryExpression,
	  UpdateExpression: UpdateExpression,
	  UnaryExpression: UnaryExpression,
	  MemberExpression: MemberExpression,
	  MetaProperty: MetaProperty,
	  CallExpression: CallExpression,
	  CallWithExpression: CallWithExpression,
	  TemplateExpression: TemplateExpression,
	  TaggedTemplateExpression: TaggedTemplateExpression,
	  NewExpression: NewExpression,
	  ParenExpression: ParenExpression,
	  ObjectLiteral: ObjectLiteral,
	  ComputedPropertyName: ComputedPropertyName,
	  PropertyDefinition: PropertyDefinition,
	  ObjectPattern: ObjectPattern,
	  PatternProperty: PatternProperty,
	  ArrayPattern: ArrayPattern,
	  PatternElement: PatternElement,
	  PatternRestElement: PatternRestElement,
	  MethodDefinition: MethodDefinition,
	  ArrayLiteral: ArrayLiteral,
	  Block: Block,
	  LabelledStatement: LabelledStatement,
	  ExpressionStatement: ExpressionStatement,
	  Directive: Directive,
	  EmptyStatement: EmptyStatement,
	  VariableDeclaration: VariableDeclaration,
	  VariableDeclarator: VariableDeclarator,
	  ReturnStatement: ReturnStatement,
	  BreakStatement: BreakStatement,
	  ContinueStatement: ContinueStatement,
	  ThrowStatement: ThrowStatement,
	  DebuggerStatement: DebuggerStatement,
	  IfStatement: IfStatement,
	  DoWhileStatement: DoWhileStatement,
	  WhileStatement: WhileStatement,
	  ForStatement: ForStatement,
	  ForInStatement: ForInStatement,
	  ForOfStatement: ForOfStatement,
	  WithStatement: WithStatement,
	  SwitchStatement: SwitchStatement,
	  SwitchCase: SwitchCase,
	  TryStatement: TryStatement,
	  CatchClause: CatchClause,
	  FunctionDeclaration: FunctionDeclaration,
	  FunctionExpression: FunctionExpression,
	  FormalParameter: FormalParameter,
	  RestParameter: RestParameter,
	  FunctionBody: FunctionBody,
	  ArrowFunctionHead: ArrowFunctionHead,
	  ArrowFunction: ArrowFunction,
	  ClassDeclaration: ClassDeclaration,
	  ClassExpression: ClassExpression,
	  ClassBody: ClassBody,
	  EmptyClassElement: EmptyClassElement,
	  ClassField: ClassField,
	  ImportCall: ImportCall,
	  ImportDeclaration: ImportDeclaration,
	  NamespaceImport: NamespaceImport,
	  NamedImports: NamedImports,
	  DefaultImport: DefaultImport,
	  ImportSpecifier: ImportSpecifier,
	  ExportDeclaration: ExportDeclaration,
	  ExportDefault: ExportDefault,
	  ExportNameList: ExportNameList,
	  ExportNamespace: ExportNamespace,
	  ExportDefaultFrom: ExportDefaultFrom,
	  ExportSpecifier: ExportSpecifier,
	  Comment: Comment,
	  Annotation: Annotation
	});
	const IDENTIFIER = [36, 0, 2, 48, 9, 3, 65, 25, 2, 95, 0, 2, 97, 25, 2, 170, 0, 2, 181, 0, 2, 183, 0, 3, 186, 0, 2, 192, 22, 2, 216, 30, 2, 248, 457, 2, 710, 11, 2, 736, 4, 2, 748, 0, 2, 750, 0, 2, 768, 111, 3, 880, 4, 2, 886, 1, 2, 890, 3, 2, 895, 0, 2, 902, 0, 2, 903, 0, 3, 904, 2, 2, 908, 0, 2, 910, 19, 2, 931, 82, 2, 1015, 138, 2, 1155, 4, 3, 1162, 165, 2, 1329, 37, 2, 1369, 0, 2, 1376, 40, 2, 1425, 44, 3, 1471, 0, 3, 1473, 1, 3, 1476, 1, 3, 1479, 0, 3, 1488, 26, 2, 1519, 3, 2, 1552, 10, 3, 1568, 42, 2, 1611, 30, 3, 1646, 1, 2, 1648, 0, 3, 1649, 98, 2, 1749, 0, 2, 1750, 6, 3, 1759, 5, 3, 1765, 1, 2, 1767, 1, 3, 1770, 3, 3, 1774, 1, 2, 1776, 9, 3, 1786, 2, 2, 1791, 0, 2, 1808, 0, 2, 1809, 0, 3, 1810, 29, 2, 1840, 26, 3, 1869, 88, 2, 1958, 10, 3, 1969, 0, 2, 1984, 9, 3, 1994, 32, 2, 2027, 8, 3, 2036, 1, 2, 2042, 0, 2, 2045, 0, 3, 2048, 21, 2, 2070, 3, 3, 2074, 0, 2, 2075, 8, 3, 2084, 0, 2, 2085, 2, 3, 2088, 0, 2, 2089, 4, 3, 2112, 24, 2, 2137, 2, 3, 2144, 10, 2, 2208, 20, 2, 2230, 7, 2, 2259, 14, 3, 2275, 32, 3, 2308, 53, 2, 2362, 2, 3, 2365, 0, 2, 2366, 17, 3, 2384, 0, 2, 2385, 6, 3, 2392, 9, 2, 2402, 1, 3, 2406, 9, 3, 2417, 15, 2, 2433, 2, 3, 2437, 7, 2, 2447, 1, 2, 2451, 21, 2, 2474, 6, 2, 2482, 0, 2, 2486, 3, 2, 2492, 0, 3, 2493, 0, 2, 2494, 6, 3, 2503, 1, 3, 2507, 2, 3, 2510, 0, 2, 2519, 0, 3, 2524, 1, 2, 2527, 2, 2, 2530, 1, 3, 2534, 9, 3, 2544, 1, 2, 2556, 0, 2, 2558, 0, 3, 2561, 2, 3, 2565, 5, 2, 2575, 1, 2, 2579, 21, 2, 2602, 6, 2, 2610, 1, 2, 2613, 1, 2, 2616, 1, 2, 2620, 0, 3, 2622, 4, 3, 2631, 1, 3, 2635, 2, 3, 2641, 0, 3, 2649, 3, 2, 2654, 0, 2, 2662, 11, 3, 2674, 2, 2, 2677, 0, 3, 2689, 2, 3, 2693, 8, 2, 2703, 2, 2, 2707, 21, 2, 2730, 6, 2, 2738, 1, 2, 2741, 4, 2, 2748, 0, 3, 2749, 0, 2, 2750, 7, 3, 2759, 2, 3, 2763, 2, 3, 2768, 0, 2, 2784, 1, 2, 2786, 1, 3, 2790, 9, 3, 2809, 0, 2, 2810, 5, 3, 2817, 2, 3, 2821, 7, 2, 2831, 1, 2, 2835, 21, 2, 2858, 6, 2, 2866, 1, 2, 2869, 4, 2, 2876, 0, 3, 2877, 0, 2, 2878, 6, 3, 2887, 1, 3, 2891, 2, 3, 2902, 1, 3, 2908, 1, 2, 2911, 2, 2, 2914, 1, 3, 2918, 9, 3, 2929, 0, 2, 2946, 0, 3, 2947, 0, 2, 2949, 5, 2, 2958, 2, 2, 2962, 3, 2, 2969, 1, 2, 2972, 0, 2, 2974, 1, 2, 2979, 1, 2, 2984, 2, 2, 2990, 11, 2, 3006, 4, 3, 3014, 2, 3, 3018, 3, 3, 3024, 0, 2, 3031, 0, 3, 3046, 9, 3, 3072, 4, 3, 3077, 7, 2, 3086, 2, 2, 3090, 22, 2, 3114, 15, 2, 3133, 0, 2, 3134, 6, 3, 3142, 2, 3, 3146, 3, 3, 3157, 1, 3, 3160, 2, 2, 3168, 1, 2, 3170, 1, 3, 3174, 9, 3, 3200, 0, 2, 3201, 2, 3, 3205, 7, 2, 3214, 2, 2, 3218, 22, 2, 3242, 9, 2, 3253, 4, 2, 3260, 0, 3, 3261, 0, 2, 3262, 6, 3, 3270, 2, 3, 3274, 3, 3, 3285, 1, 3, 3294, 0, 2, 3296, 1, 2, 3298, 1, 3, 3302, 9, 3, 3313, 1, 2, 3328, 3, 3, 3333, 7, 2, 3342, 2, 2, 3346, 40, 2, 3387, 1, 3, 3389, 0, 2, 3390, 6, 3, 3398, 2, 3, 3402, 3, 3, 3406, 0, 2, 3412, 2, 2, 3415, 0, 3, 3423, 2, 2, 3426, 1, 3, 3430, 9, 3, 3450, 5, 2, 3458, 1, 3, 3461, 17, 2, 3482, 23, 2, 3507, 8, 2, 3517, 0, 2, 3520, 6, 2, 3530, 0, 3, 3535, 5, 3, 3542, 0, 3, 3544, 7, 3, 3558, 9, 3, 3570, 1, 3, 3585, 47, 2, 3633, 0, 3, 3634, 1, 2, 3636, 6, 3, 3648, 6, 2, 3655, 7, 3, 3664, 9, 3, 3713, 1, 2, 3716, 0, 2, 3719, 1, 2, 3722, 0, 2, 3725, 0, 2, 3732, 3, 2, 3737, 6, 2, 3745, 2, 2, 3749, 0, 2, 3751, 0, 2, 3754, 1, 2, 3757, 3, 2, 3761, 0, 3, 3762, 1, 2, 3764, 5, 3, 3771, 1, 3, 3773, 0, 2, 3776, 4, 2, 3782, 0, 2, 3784, 5, 3, 3792, 9, 3, 3804, 3, 2, 3840, 0, 2, 3864, 1, 3, 3872, 9, 3, 3893, 0, 3, 3895, 0, 3, 3897, 0, 3, 3902, 1, 3, 3904, 7, 2, 3913, 35, 2, 3953, 19, 3, 3974, 1, 3, 3976, 4, 2, 3981, 10, 3, 3993, 35, 3, 4038, 0, 3, 4096, 42, 2, 4139, 19, 3, 4159, 0, 2, 4160, 9, 3, 4176, 5, 2, 4182, 3, 3, 4186, 3, 2, 4190, 2, 3, 4193, 0, 2, 4194, 2, 3, 4197, 1, 2, 4199, 6, 3, 4206, 2, 2, 4209, 3, 3, 4213, 12, 2, 4226, 11, 3, 4238, 0, 2, 4239, 14, 3, 4256, 37, 2, 4295, 0, 2, 4301, 0, 2, 4304, 42, 2, 4348, 332, 2, 4682, 3, 2, 4688, 6, 2, 4696, 0, 2, 4698, 3, 2, 4704, 40, 2, 4746, 3, 2, 4752, 32, 2, 4786, 3, 2, 4792, 6, 2, 4800, 0, 2, 4802, 3, 2, 4808, 14, 2, 4824, 56, 2, 4882, 3, 2, 4888, 66, 2, 4957, 2, 3, 4969, 8, 3, 4992, 15, 2, 5024, 85, 2, 5112, 5, 2, 5121, 619, 2, 5743, 16, 2, 5761, 25, 2, 5792, 74, 2, 5870, 10, 2, 5888, 12, 2, 5902, 3, 2, 5906, 2, 3, 5920, 17, 2, 5938, 2, 3, 5952, 17, 2, 5970, 1, 3, 5984, 12, 2, 5998, 2, 2, 6002, 1, 3, 6016, 51, 2, 6068, 31, 3, 6103, 0, 2, 6108, 0, 2, 6109, 0, 3, 6112, 9, 3, 6155, 2, 3, 6160, 9, 3, 6176, 88, 2, 6272, 40, 2, 6313, 0, 3, 6314, 0, 2, 6320, 69, 2, 6400, 30, 2, 6432, 11, 3, 6448, 11, 3, 6470, 9, 3, 6480, 29, 2, 6512, 4, 2, 6528, 43, 2, 6576, 25, 2, 6608, 10, 3, 6656, 22, 2, 6679, 4, 3, 6688, 52, 2, 6741, 9, 3, 6752, 28, 3, 6783, 10, 3, 6800, 9, 3, 6823, 0, 2, 6832, 13, 3, 6912, 4, 3, 6917, 46, 2, 6964, 16, 3, 6981, 6, 2, 6992, 9, 3, 7019, 8, 3, 7040, 2, 3, 7043, 29, 2, 7073, 12, 3, 7086, 1, 2, 7088, 9, 3, 7098, 43, 2, 7142, 13, 3, 7168, 35, 2, 7204, 19, 3, 7232, 9, 3, 7245, 2, 2, 7248, 9, 3, 7258, 35, 2, 7296, 8, 2, 7312, 42, 2, 7357, 2, 2, 7376, 2, 3, 7380, 20, 3, 7401, 3, 2, 7405, 0, 3, 7406, 3, 2, 7410, 2, 3, 7413, 1, 2, 7415, 2, 3, 7424, 191, 2, 7616, 57, 3, 7675, 4, 3, 7680, 277, 2, 7960, 5, 2, 7968, 37, 2, 8008, 5, 2, 8016, 7, 2, 8025, 0, 2, 8027, 0, 2, 8029, 0, 2, 8031, 30, 2, 8064, 52, 2, 8118, 6, 2, 8126, 0, 2, 8130, 2, 2, 8134, 6, 2, 8144, 3, 2, 8150, 5, 2, 8160, 12, 2, 8178, 2, 2, 8182, 6, 2, 8204, 1, 3, 8255, 1, 3, 8276, 0, 3, 8305, 0, 2, 8319, 0, 2, 8336, 12, 2, 8400, 12, 3, 8417, 0, 3, 8421, 11, 3, 8450, 0, 2, 8455, 0, 2, 8458, 9, 2, 8469, 0, 2, 8472, 5, 2, 8484, 0, 2, 8486, 0, 2, 8488, 0, 2, 8490, 15, 2, 8508, 3, 2, 8517, 4, 2, 8526, 0, 2, 8544, 40, 2, 11264, 46, 2, 11312, 46, 2, 11360, 132, 2, 11499, 3, 2, 11503, 2, 3, 11506, 1, 2, 11520, 37, 2, 11559, 0, 2, 11565, 0, 2, 11568, 55, 2, 11631, 0, 2, 11647, 0, 3, 11648, 22, 2, 11680, 6, 2, 11688, 6, 2, 11696, 6, 2, 11704, 6, 2, 11712, 6, 2, 11720, 6, 2, 11728, 6, 2, 11736, 6, 2, 11744, 31, 3, 12293, 2, 2, 12321, 8, 2, 12330, 5, 3, 12337, 4, 2, 12344, 4, 2, 12353, 85, 2, 12441, 1, 3, 12443, 4, 2, 12449, 89, 2, 12540, 3, 2, 12549, 42, 2, 12593, 93, 2, 12704, 26, 2, 12784, 15, 2, 13312, 6581, 2, 19968, 20975, 2, 40960, 1164, 2, 42192, 45, 2, 42240, 268, 2, 42512, 15, 2, 42528, 9, 3, 42538, 1, 2, 42560, 46, 2, 42607, 0, 3, 42612, 9, 3, 42623, 30, 2, 42654, 1, 3, 42656, 79, 2, 42736, 1, 3, 42775, 8, 2, 42786, 102, 2, 42891, 46, 2, 42999, 10, 2, 43010, 0, 3, 43011, 2, 2, 43014, 0, 3, 43015, 3, 2, 43019, 0, 3, 43020, 22, 2, 43043, 4, 3, 43072, 51, 2, 43136, 1, 3, 43138, 49, 2, 43188, 17, 3, 43216, 9, 3, 43232, 17, 3, 43250, 5, 2, 43259, 0, 2, 43261, 1, 2, 43263, 10, 3, 43274, 27, 2, 43302, 7, 3, 43312, 22, 2, 43335, 12, 3, 43360, 28, 2, 43392, 3, 3, 43396, 46, 2, 43443, 13, 3, 43471, 0, 2, 43472, 9, 3, 43488, 4, 2, 43493, 0, 3, 43494, 9, 2, 43504, 9, 3, 43514, 4, 2, 43520, 40, 2, 43561, 13, 3, 43584, 2, 2, 43587, 0, 3, 43588, 7, 2, 43596, 1, 3, 43600, 9, 3, 43616, 22, 2, 43642, 0, 2, 43643, 2, 3, 43646, 49, 2, 43696, 0, 3, 43697, 0, 2, 43698, 2, 3, 43701, 1, 2, 43703, 1, 3, 43705, 4, 2, 43710, 1, 3, 43712, 0, 2, 43713, 0, 3, 43714, 0, 2, 43739, 2, 2, 43744, 10, 2, 43755, 4, 3, 43762, 2, 2, 43765, 1, 3, 43777, 5, 2, 43785, 5, 2, 43793, 5, 2, 43808, 6, 2, 43816, 6, 2, 43824, 42, 2, 43868, 9, 2, 43888, 114, 2, 44003, 7, 3, 44012, 1, 3, 44016, 9, 3, 44032, 11171, 2, 55216, 22, 2, 55243, 48, 2, 63744, 365, 2, 64112, 105, 2, 64256, 6, 2, 64275, 4, 2, 64285, 0, 2, 64286, 0, 3, 64287, 9, 2, 64298, 12, 2, 64312, 4, 2, 64318, 0, 2, 64320, 1, 2, 64323, 1, 2, 64326, 107, 2, 64467, 362, 2, 64848, 63, 2, 64914, 53, 2, 65008, 11, 2, 65024, 15, 3, 65056, 15, 3, 65075, 1, 3, 65101, 2, 3, 65136, 4, 2, 65142, 134, 2, 65296, 9, 3, 65313, 25, 2, 65343, 0, 3, 65345, 25, 2, 65382, 88, 2, 65474, 5, 2, 65482, 5, 2, 65490, 5, 2, 65498, 2, 2, 65536, 11, 2, 65549, 25, 2, 65576, 18, 2, 65596, 1, 2, 65599, 14, 2, 65616, 13, 2, 65664, 122, 2, 65856, 52, 2, 66045, 0, 3, 66176, 28, 2, 66208, 48, 2, 66272, 0, 3, 66304, 31, 2, 66349, 29, 2, 66384, 37, 2, 66422, 4, 3, 66432, 29, 2, 66464, 35, 2, 66504, 7, 2, 66513, 4, 2, 66560, 157, 2, 66720, 9, 3, 66736, 35, 2, 66776, 35, 2, 66816, 39, 2, 66864, 51, 2, 67072, 310, 2, 67392, 21, 2, 67424, 7, 2, 67584, 5, 2, 67592, 0, 2, 67594, 43, 2, 67639, 1, 2, 67644, 0, 2, 67647, 22, 2, 67680, 22, 2, 67712, 30, 2, 67808, 18, 2, 67828, 1, 2, 67840, 21, 2, 67872, 25, 2, 67968, 55, 2, 68030, 1, 2, 68096, 0, 2, 68097, 2, 3, 68101, 1, 3, 68108, 3, 3, 68112, 3, 2, 68117, 2, 2, 68121, 28, 2, 68152, 2, 3, 68159, 0, 3, 68192, 28, 2, 68224, 28, 2, 68288, 7, 2, 68297, 27, 2, 68325, 1, 3, 68352, 53, 2, 68416, 21, 2, 68448, 18, 2, 68480, 17, 2, 68608, 72, 2, 68736, 50, 2, 68800, 50, 2, 68864, 35, 2, 68900, 3, 3, 68912, 9, 3, 69376, 28, 2, 69415, 0, 2, 69424, 21, 2, 69446, 10, 3, 69632, 2, 3, 69635, 52, 2, 69688, 14, 3, 69734, 9, 3, 69759, 3, 3, 69763, 44, 2, 69808, 10, 3, 69840, 24, 2, 69872, 9, 3, 69888, 2, 3, 69891, 35, 2, 69927, 13, 3, 69942, 9, 3, 69956, 0, 2, 69957, 1, 3, 69968, 34, 2, 70003, 0, 3, 70006, 0, 2, 70016, 2, 3, 70019, 47, 2, 70067, 13, 3, 70081, 3, 2, 70089, 3, 3, 70096, 9, 3, 70106, 0, 2, 70108, 0, 2, 70144, 17, 2, 70163, 24, 2, 70188, 11, 3, 70206, 0, 3, 70272, 6, 2, 70280, 0, 2, 70282, 3, 2, 70287, 14, 2, 70303, 9, 2, 70320, 46, 2, 70367, 11, 3, 70384, 9, 3, 70400, 3, 3, 70405, 7, 2, 70415, 1, 2, 70419, 21, 2, 70442, 6, 2, 70450, 1, 2, 70453, 4, 2, 70459, 1, 3, 70461, 0, 2, 70462, 6, 3, 70471, 1, 3, 70475, 2, 3, 70480, 0, 2, 70487, 0, 3, 70493, 4, 2, 70498, 1, 3, 70502, 6, 3, 70512, 4, 3, 70656, 52, 2, 70709, 17, 3, 70727, 3, 2, 70736, 9, 3, 70750, 0, 3, 70784, 47, 2, 70832, 19, 3, 70852, 1, 2, 70855, 0, 2, 70864, 9, 3, 71040, 46, 2, 71087, 6, 3, 71096, 8, 3, 71128, 3, 2, 71132, 1, 3, 71168, 47, 2, 71216, 16, 3, 71236, 0, 2, 71248, 9, 3, 71296, 42, 2, 71339, 12, 3, 71360, 9, 3, 71424, 26, 2, 71453, 14, 3, 71472, 9, 3, 71680, 43, 2, 71724, 14, 3, 71840, 63, 2, 71904, 9, 3, 71935, 0, 2, 72192, 0, 2, 72193, 9, 3, 72203, 39, 2, 72243, 6, 3, 72250, 0, 2, 72251, 3, 3, 72263, 0, 3, 72272, 0, 2, 72273, 10, 3, 72284, 39, 2, 72326, 3, 2, 72330, 15, 3, 72349, 0, 2, 72384, 56, 2, 72704, 8, 2, 72714, 36, 2, 72751, 7, 3, 72760, 7, 3, 72768, 0, 2, 72784, 9, 3, 72818, 29, 2, 72850, 21, 3, 72873, 13, 3, 72960, 6, 2, 72968, 1, 2, 72971, 37, 2, 73009, 5, 3, 73018, 0, 3, 73020, 1, 3, 73023, 6, 3, 73030, 0, 2, 73031, 0, 3, 73040, 9, 3, 73056, 5, 2, 73063, 1, 2, 73066, 31, 2, 73098, 4, 3, 73104, 1, 3, 73107, 4, 3, 73112, 0, 2, 73120, 9, 3, 73440, 18, 2, 73459, 3, 3, 73728, 921, 2, 74752, 110, 2, 74880, 195, 2, 77824, 1070, 2, 82944, 582, 2, 92160, 568, 2, 92736, 30, 2, 92768, 9, 3, 92880, 29, 2, 92912, 4, 3, 92928, 47, 2, 92976, 6, 3, 92992, 3, 2, 93008, 9, 3, 93027, 20, 2, 93053, 18, 2, 93760, 63, 2, 93952, 68, 2, 94032, 0, 2, 94033, 45, 3, 94095, 3, 3, 94099, 12, 2, 94176, 1, 2, 94208, 6129, 2, 100352, 754, 2, 110592, 286, 2, 110960, 395, 2, 113664, 106, 2, 113776, 12, 2, 113792, 8, 2, 113808, 9, 2, 113821, 1, 3, 119141, 4, 3, 119149, 5, 3, 119163, 7, 3, 119173, 6, 3, 119210, 3, 3, 119362, 2, 3, 119808, 84, 2, 119894, 70, 2, 119966, 1, 2, 119970, 0, 2, 119973, 1, 2, 119977, 3, 2, 119982, 11, 2, 119995, 0, 2, 119997, 6, 2, 120005, 64, 2, 120071, 3, 2, 120077, 7, 2, 120086, 6, 2, 120094, 27, 2, 120123, 3, 2, 120128, 4, 2, 120134, 0, 2, 120138, 6, 2, 120146, 339, 2, 120488, 24, 2, 120514, 24, 2, 120540, 30, 2, 120572, 24, 2, 120598, 30, 2, 120630, 24, 2, 120656, 30, 2, 120688, 24, 2, 120714, 30, 2, 120746, 24, 2, 120772, 7, 2, 120782, 49, 3, 121344, 54, 3, 121403, 49, 3, 121461, 0, 3, 121476, 0, 3, 121499, 4, 3, 121505, 14, 3, 122880, 6, 3, 122888, 16, 3, 122907, 6, 3, 122915, 1, 3, 122918, 4, 3, 124928, 196, 2, 125136, 6, 3, 125184, 67, 2, 125252, 6, 3, 125264, 9, 3, 126464, 3, 2, 126469, 26, 2, 126497, 1, 2, 126500, 0, 2, 126503, 0, 2, 126505, 9, 2, 126516, 3, 2, 126521, 0, 2, 126523, 0, 2, 126530, 0, 2, 126535, 0, 2, 126537, 0, 2, 126539, 0, 2, 126541, 2, 2, 126545, 1, 2, 126548, 0, 2, 126551, 0, 2, 126553, 0, 2, 126555, 0, 2, 126557, 0, 2, 126559, 0, 2, 126561, 1, 2, 126564, 0, 2, 126567, 3, 2, 126572, 6, 2, 126580, 3, 2, 126585, 3, 2, 126590, 0, 2, 126592, 9, 2, 126603, 16, 2, 126625, 2, 2, 126629, 4, 2, 126635, 16, 2, 131072, 42710, 2, 173824, 4148, 2, 177984, 221, 2, 178208, 5761, 2, 183984, 7472, 2, 194560, 541, 2, 917760, 239, 3];
	const WHITESPACE = [9, 0, 1, 11, 1, 1, 32, 0, 1, 160, 0, 1, 5760, 0, 1, 8192, 10, 1, 8239, 0, 1, 8287, 0, 1, 12288, 0, 1, 65279, 0, 1];

	function binarySearch(table, val) {
	  let right = (table.length / 3) - 1;
	  let left = 0;
	  let mid = 0;
	  let test = 0;
	  let offset = 0;
	  while (left <= right) {
	    mid = (left + right) >> 1;
	    offset = mid * 3;
	    test = table[offset];
	    if (val < test) {
	      right = mid - 1;
	    } else if (val === test || val <= test + table[offset + 1]) {
	      return table[offset + 2];
	    } else {
	      left = mid + 1;
	    }
	  }
	  return 0;
	}

	function isIdentifierStart(code) {
	  return binarySearch(IDENTIFIER, code) === 2;
	}

	function isIdentifierPart(code) {
	  return binarySearch(IDENTIFIER, code) >= 2;
	}

	function isWhitespace(code) {
	  return binarySearch(WHITESPACE, code) === 1;
	}

	function codePointLength(code) {
	  return code > 65535 ? 2 : 1;
	}

	function codePointAt(str, offset) {
	  let a = str.charCodeAt(offset);
	  if (a >= 55296 && a <= 56319 && str.length > offset + 1) {
	    let b = str.charCodeAt(offset + 1);
	    if (b >= 56320 && b <= 57343) return (a - 55296) * 1024 + b - 56320 + 65536;
	  }
	  return a;
	}

	function codePointString(code) {
	  if (code > 1114111) return '';
	  if (code <= 65535) return String.fromCharCode(code);
	  code -= 65536;
	  return String.fromCharCode((code >> 10) + 55296, (code % 1024) + 56320);
	}

	function binarySearch$1(array, val) {
	  let right = array.length - 1;
	  let left = 0;
	  while (left <= right) {
	    let mid = (left + right) >> 1;
	    let test = array[mid];
	    if (val === test) return mid;
	    if (val < test) right = mid - 1;
	    else left = mid + 1;
	  }
	  return right;
	}

	class LineMap {
	  constructor() {
	    this.lines = [0];
	    this.lastLineBreak = -1;
	  }

	  addBreak(offset) {
	    if (offset > this.lastLineBreak) this.lines.push(this.lastLineBreak = offset);
	  }

	  locate(offset) {
	    let line = binarySearch$1(this.lines, offset);
	    let lineOffset = this.lines[line];
	    return {
	      line,
	      column: offset - lineOffset,
	      lineOffset
	    };
	  }
	}

	const crNewline = /\r\n?/g;
	const reservedWord = new RegExp('^(?:' + 'break|case|catch|class|const|continue|debugger|default|delete|do|' + 'else|enum|export|extends|false|finally|for|function|if|import|in|' + 'instanceof|new|null|return|super|switch|this|throw|true|try|typeof|' + 'var|void|while|with' + ')$');
	const strictReservedWord = new RegExp('^(?:' + 'implements|private|public|interface|package|let|protected|static|yield' + ')$');
	const multiCharPunctuator = new RegExp('^(?:' + '--|[+]{2}|' + '&&|[|]{2}|[?]{2}|' + '<<=?|' + '>>>?=?|' + '[!=]==|' + '=>|' + '->|' + '[\\.]{2,3}|' + '[-+&|<>!=*&^%\\/]=|' + '[*]{2}=?' + ')$');
	const octalEscape = /^(?:[0-3][0-7]{0,2}|[4-7][0-7]?)/;
	const blockCommentPattern = /\r\n?|[\n\u2028\u2029]|\*\//g;
	const hexChar = /[0-9a-f]/i;

	function makeCharTable() {
	  let table = [];
	  for (let i = 0; i < 128; ++i) table[i] = '';
	  for (let i = 65; i <= 90; ++i) table[i] = 'identifier';
	  for (let i = 97; i <= 122; ++i) table[i] = 'identifier';
	  add('whitespace', '\t\v\f ');
	  add('newline', '\r\n');
	  add('decimal-digit', '123456789');
	  add('punctuator-char', '{[]();,#');
	  add('punctuator', '<>+-*%&|^!~=:?');
	  add('dot', '.');
	  add('slash', '/');
	  add('rbrace', '}');
	  add('zero', '0');
	  add('string', '"\'');
	  add('template', '`');
	  add('symbol', '@');
	  add('identifier', '$_\\');
	  return table;

	  function add(type, string) {
	    string.split('').forEach((c) => table[c.charCodeAt(0)] = type);
	  }
	}

	const charTable = makeCharTable();

	function isIdentifierPartAscii(c) {
	  return (c > 64 && c < 91 || c > 96 && c < 123 || c > 47 && c < 58 || c === 36 || c === 95);
	}

	function isNewlineChar(c, asciiOnly = false) {
	  switch (c) {
	    case '\r':
	    case '\n':
	      return true;
	    case '\u2028':
	    case '\u2029':
	      return !asciiOnly;
	  }
	  return false;
	}

	function isPunctuatorNext(c) {
	  switch (c) {
	    case '+':
	    case '-':
	    case '&':
	    case '|':
	    case '<':
	    case '>':
	    case '=':
	    case '.':
	    case ':':
	    case '*':
	    case '?':
	      return true;
	  }
	  return false;
	}

	function isReservedWord(word) {
	  return reservedWord.test(word);
	}

	function isStrictReservedWord(word) {
	  return strictReservedWord.test(word);
	}

	class Scanner {
	  constructor(input, offset) {
	    this.input = input || '';
	    this.offset = offset || 0;
	    this.length = this.input.length;
	    this.lineMap = new LineMap();
	    this.value = '';
	    this.number = 0;
	    this.numberSuffix = '';
	    this.regexFlags = '';
	    this.templateEnd = false;
	    this.newlineBefore = false;
	    this.strictError = '';
	    this.start = 0;
	    this.end = 0;
	  }

	  skip() {
	    return this.next('skip');
	  }

	  next(context) {
	    if (this.type !== 'COMMENT') this.newlineBefore = false;
	    this.strictError = '';
	    do {
	      this.start = this.offset;
	      this.type = this.start >= this.length ? this.EOF() : context === 'skip' ? this.Skip() : this.Start(context);
	    } while (!this.type)
	    ;
	    this.end = this.offset;
	    return this.type;
	  }

	  rawValue(start, end) {
	    return this.input.slice(start, end).replace(crNewline, '\n');
	  }

	  peekChar() {
	    return this.input.charAt(this.offset);
	  }

	  peekCharAt(n) {
	    return this.input.charAt(this.offset + n);
	  }

	  peekCodePoint() {
	    return codePointAt(this.input, this.offset);
	  }

	  peekCode() {
	    return this.input.charCodeAt(this.offset) | 0;
	  }

	  peekCodeAt(n) {
	    return this.input.charCodeAt(this.offset + n) | 0;
	  }

	  readChar() {
	    return this.input.charAt(this.offset++);
	  }

	  readUnicodeEscapeValue() {
	    let hex = '';
	    if (this.peekChar() === '{') {
	      this.offset++;
	      hex = this.readHex(0);
	      if (hex.length < 1 || this.readChar() !== '}') return null;
	    } else {
	      hex = this.readHex(4);
	      if (hex.length < 4) return null;
	    }
	    return parseInt(hex, 16);
	  }

	  readUnicodeEscape() {
	    let cp = this.readUnicodeEscapeValue();
	    let val = codePointString(cp);
	    return val === '' ? null : val;
	  }

	  readIdentifierEscape(startChar) {
	    this.offset++;
	    if (this.readChar() !== 'u') return null;
	    let cp = this.readUnicodeEscapeValue();
	    if (startChar) {
	      if (!isIdentifierStart(cp)) return null;
	    } else {
	      if (!isIdentifierPart(cp)) return null;
	    }
	    return codePointString(cp);
	  }

	  readOctalEscape() {
	    let m = octalEscape.exec(this.input.slice(this.offset, this.offset + 3));
	    let val = m ? m[0] : '';
	    this.offset += val.length;
	    return val;
	  }

	  readStringEscape(continuationChar) {
	    this.offset++;
	    let chr = '';
	    let esc = '';
	    switch (chr = this.readChar()) {
	      case 't':
	        return '\t';
	      case 'b':
	        return '\b';
	      case 'v':
	        return '\v';
	      case 'f':
	        return '\f';
	      case 'r':
	        return '\r';
	      case 'n':
	        return '\n';
	      case '\r':
	        if (this.peekChar() === '\n') this.offset++;
	        this.lineMap.addBreak(this.offset);
	        return continuationChar;
	      case '\n':
	      case '\u2028':
	      case '\u2029':
	        this.lineMap.addBreak(this.offset);
	        return continuationChar;
	      case '0':
	      case '1':
	      case '2':
	      case '3':
	      case '4':
	      case '5':
	      case '6':
	      case '7':
	        this.offset--;
	        esc = this.readOctalEscape();
	        if (esc === '0') {
	          return String.fromCharCode(0);
	        } else {
	          this.strictError = 'Octal literals are not allowed in strict mode';
	          return String.fromCharCode(parseInt(esc, 8));
	        }
	      case 'x':
	        esc = this.readHex(2);
	        return (esc.length < 2) ? null : String.fromCharCode(parseInt(esc, 16));
	      case 'u':
	        return this.readUnicodeEscape();
	      default:
	        return chr;
	    }
	  }

	  readRange(low, high) {
	    let start = this.offset;
	    let code = 0;
	    while (code = this.peekCode()) {
	      if (code >= low && code <= high) this.offset++;
	      else break;
	    }
	    return this.input.slice(start, this.offset);
	  }

	  readInteger() {
	    let start = this.offset;
	    let code = 0;
	    while (code = this.peekCode()) {
	      if (code >= 48 && code <= 57) this.offset++;
	      else break;
	    }
	    return this.input.slice(start, this.offset);
	  }

	  readIntegerSuffix() {
	    if (this.peekCode() === 110) {
	      this.numberSuffix = 'n';
	      this.offset++;
	      return true;
	    }
	    this.numberSuffix = '';
	    return false;
	  }

	  readHex(maxLen) {
	    let str = '';
	    let chr = '';
	    while (chr = this.peekChar()) {
	      if (!hexChar.test(chr)) break;
	      str += chr;
	      this.offset++;
	      if (str.length === maxLen) break;
	    }
	    return str;
	  }

	  peekNumberFollow() {
	    let c = this.peekCode();
	    if (c > 127) return !isIdentifierStart(this.peekCodePoint());
	    return !(c > 64 && c < 91 || c > 96 && c < 123 || c > 47 && c < 58 || c === 36 || c === 95 || c === 92);
	  }

	  Skip() {
	    let code = this.peekCode();
	    if (code < 128) {
	      switch (charTable[code]) {
	        case 'whitespace':
	          return this.Whitespace();
	        case 'newline':
	          return this.Newline(code);
	        case 'slash':
	          {
	            let next = this.peekCodeAt(1);
	            if (next === 47) return this.LineComment();
	            else if (next === 42) return this.BlockComment();
	          }
	      }
	    } else {
	      if (isNewlineChar(this.peekChar())) return this.Newline(code);
	      let cp = this.peekCodePoint();
	      if (isWhitespace(cp)) return this.UnicodeWhitespace(cp);
	    }
	    return 'UNKNOWN';
	  }

	  Start(context) {
	    let code = this.peekCode();
	    let next = 0;
	    switch (charTable[code]) {
	      case 'punctuator-char':
	        return this.PunctuatorChar();
	      case 'whitespace':
	        return this.Whitespace();
	      case 'identifier':
	        return this.Identifier(context, code);
	      case 'rbrace':
	        if (context === 'template') return this.Template();
	        else return this.PunctuatorChar();
	      case 'punctuator':
	        return this.Punctuator();
	      case 'newline':
	        return this.Newline(code);
	      case 'decimal-digit':
	        return this.Number();
	      case 'template':
	        return this.Template();
	      case 'string':
	        return this.String();
	      case 'zero':
	        switch (next = this.peekCodeAt(1)) {
	          case 88:
	          case 120:
	            return this.HexNumber();
	          case 66:
	          case 98:
	            return this.BinaryNumber();
	          case 79:
	          case 111:
	            return this.OctalNumber();
	        }
	        return next >= 48 && next <= 55 ? this.LegacyOctalNumber() : this.Number();
	      case 'dot':
	        next = this.peekCodeAt(1);
	        if (next >= 48 && next <= 57) return this.Number();
	        else return this.Punctuator();
	      case 'slash':
	        next = this.peekCodeAt(1);
	        if (next === 47) return this.LineComment();
	        else if (next === 42) return this.BlockComment();
	        else if (context === 'div') return this.Punctuator();
	        else return this.RegularExpression();
	      case 'symbol':
	        return this.Symbol();
	    }
	    if (isNewlineChar(this.peekChar())) return this.Newline(code);
	    let cp = this.peekCodePoint();
	    if (isWhitespace(cp)) return this.UnicodeWhitespace(cp);
	    if (isIdentifierStart(cp)) return this.Identifier(context, cp);
	    return this.Error();
	  }

	  Whitespace() {
	    this.offset++;
	    let code = 0;
	    while (code = this.peekCode()) {
	      if (code === 9 || code === 11 || code === 12 || code === 32) this.offset++;
	      else break;
	    }
	    return '';
	  }

	  UnicodeWhitespace(cp) {
	    this.offset += codePointLength(cp);
	    while (isWhitespace(cp = this.peekCodePoint())) this.offset += codePointLength(cp);
	    return '';
	  }

	  Newline(code) {
	    this.offset++;
	    if (code === 13 && this.peekCode() === 10) this.offset++;
	    this.lineMap.addBreak(this.offset);
	    this.newlineBefore = true;
	    return '';
	  }

	  PunctuatorChar() {
	    return this.readChar();
	  }

	  Punctuator() {
	    let op = this.readChar();
	    let chr = '';
	    let next = '';
	    while (isPunctuatorNext(chr = this.peekChar()) && multiCharPunctuator.test(next = op + chr)) {
	      this.offset++;
	      op = next;
	    }
	    if (op === '..') {
	      this.offset--;
	      op = '.';
	    }
	    return op;
	  }

	  Template() {
	    let end = false;
	    let val = '';
	    let esc = '';
	    let chr = '';
	    this.readChar();
	    while (chr = this.peekChar()) {
	      if (chr === '`') {
	        end = true;
	        break;
	      }
	      if (chr === '$' && this.peekCharAt(1) === '{') {
	        this.offset++;
	        break;
	      }
	      if (chr === '\\') {
	        esc = this.readStringEscape('\n');
	        if (esc === null) return this.Error();
	        val += esc;
	      } else {
	        val += chr;
	        this.offset++;
	      }
	    }
	    if (!chr) return this.Error();
	    this.offset++;
	    this.value = val;
	    this.templateEnd = end;
	    return 'TEMPLATE';
	  }

	  String() {
	    let delim = this.readChar();
	    let val = '';
	    let esc = '';
	    let chr = '';
	    while (chr = this.input[this.offset]) {
	      if (chr === delim) break;
	      if (isNewlineChar(chr, true)) return this.Error();
	      if (chr === '\\') {
	        esc = this.readStringEscape('');
	        if (esc === null) return this.Error();
	        val += esc;
	      } else {
	        val += chr;
	        this.offset++;
	      }
	    }
	    if (!chr) return this.Error();
	    this.offset++;
	    this.value = val;
	    return 'STRING';
	  }

	  RegularExpression() {
	    this.offset++;
	    let backslash = false;
	    let inClass = false;
	    let val = '';
	    let chr = '';
	    let code = 0;
	    let flagStart = 0;
	    while (chr = this.readChar()) {
	      if (isNewlineChar(chr)) return this.Error();
	      if (backslash) {
	        val += '\\' + chr;
	        backslash = false;
	      } else if (chr === '[') {
	        inClass = true;
	        val += chr;
	      } else if (chr === ']' && inClass) {
	        inClass = false;
	        val += chr;
	      } else if (chr === '/' && !inClass) {
	        break;
	      } else if (chr === '\\') {
	        backslash = true;
	      } else {
	        val += chr;
	      }
	    }
	    if (!chr) return this.Error();
	    flagStart = this.offset;
	    while (true) {
	      code = this.peekCode();
	      if (code === 92) {
	        return this.Error();
	      } else if (code > 127) {
	        if (isIdentifierPart(code = this.peekCodePoint())) this.offset += codePointLength(code);
	        else break;
	      } else if (isIdentifierPartAscii(code)) {
	        this.offset++;
	      } else {
	        break;
	      }
	    }
	    this.value = val;
	    this.regexFlags = this.input.slice(flagStart, this.offset);
	    return 'REGEX';
	  }

	  LegacyOctalNumber() {
	    this.offset++;
	    let start = this.offset;
	    let code = 0;
	    while (code = this.peekCode()) {
	      if (code >= 48 && code <= 55) this.offset++;
	      else break;
	    }
	    this.strictError = 'Octal literals are not allowed in strict mode';
	    let val = parseInt(this.input.slice(start, this.offset), 8);
	    if (!this.peekNumberFollow()) return this.Error();
	    this.number = val;
	    return 'NUMBER';
	  }

	  Number() {
	    let start = this.offset;
	    let next = '';
	    let val;
	    let intString = this.readInteger();
	    if (this.readIntegerSuffix()) {
	      val = parseInt(intString, 10);
	    } else {
	      if ((next = this.peekChar()) === '.') {
	        this.offset++;
	        this.readInteger();
	        next = this.peekChar();
	      }
	      if (next === 'e' || next === 'E') {
	        this.offset++;
	        next = this.peekChar();
	        if (next === '+' || next === '-') this.offset++;
	        if (!this.readInteger()) return this.Error();
	      }
	      val = parseFloat(this.input.slice(start, this.offset));
	    }
	    if (!this.peekNumberFollow()) return this.Error();
	    this.number = val;
	    return 'NUMBER';
	  }

	  BinaryNumber() {
	    this.offset += 2;
	    let val = parseInt(this.readRange(48, 49), 2);
	    this.readIntegerSuffix();
	    if (!this.peekNumberFollow()) return this.Error();
	    this.number = val;
	    return 'NUMBER';
	  }

	  OctalNumber() {
	    this.offset += 2;
	    let val = parseInt(this.readRange(48, 55), 8);
	    this.readIntegerSuffix();
	    if (!this.peekNumberFollow()) return this.Error();
	    this.number = val;
	    return 'NUMBER';
	  }

	  HexNumber() {
	    this.offset += 2;
	    let val = parseInt(this.readHex(0), 16);
	    this.readIntegerSuffix();
	    if (!this.peekNumberFollow()) return this.Error();
	    this.number = val;
	    return 'NUMBER';
	  }

	  Identifier(context, code) {
	    let start = this.offset;
	    let val = '';
	    let esc = '';
	    if (code === 92) {
	      esc = this.readIdentifierEscape(true);
	      if (esc === null) return this.Error();
	      val = esc;
	      start = this.offset;
	    } else if (code > 127) {
	      this.offset += codePointLength(code);
	    } else {
	      this.offset++;
	    }
	    while (true) {
	      code = this.peekCode();
	      if (code === 92) {
	        val += this.input.slice(start, this.offset);
	        esc = this.readIdentifierEscape(false);
	        if (esc === null) return this.Error();
	        val += esc;
	        start = this.offset;
	      } else if (code > 127) {
	        if (isIdentifierPart(code = this.peekCodePoint())) this.offset += codePointLength(code);
	        else break;
	      } else if (isIdentifierPartAscii(code)) {
	        this.offset++;
	      } else {
	        break;
	      }
	    }
	    val += this.input.slice(start, this.offset);
	    this.value = val;
	    if (context !== 'name' && isReservedWord(val)) return esc ? this.Error() : val;
	    return 'IDENTIFIER';
	  }

	  Symbol() {
	    this.Identifier('', 0);
	    return 'SYMBOL';
	  }

	  LineComment() {
	    this.offset += 2;
	    let start = this.offset;
	    let chr = '';
	    while (chr = this.peekChar()) {
	      if (isNewlineChar(chr)) break;
	      this.offset++;
	    }
	    this.value = this.input.slice(start, this.offset);
	    return 'COMMENT';
	  }

	  BlockComment() {
	    this.offset += 2;
	    let pattern = blockCommentPattern;
	    let start = this.offset;
	    while (true) {
	      pattern.lastIndex = this.offset;
	      let m = pattern.exec(this.input);
	      if (!m) return this.Error();
	      this.offset = m.index + m[0].length;
	      if (m[0] === '*/') break;
	      this.newlineBefore = true;
	      this.lineMap.addBreak(m.index);
	    }
	    this.value = this.input.slice(start, this.offset - 2);
	    return 'COMMENT';
	  }

	  EOF() {
	    return 'EOF';
	  }

	  Error() {
	    if (this.start === this.offset) this.offset++;
	    return 'ILLEGAL';
	  }
	}

	class Transform {
	  transformFormals(expr) {
	    if (!expr) return [];
	    let trailingComma = false;
	    let list;
	    switch (expr.type) {
	      case 'SequenceExpression':
	        list = expr.expressions;
	        if (expr.error) {
	          trailingComma = true;
	          expr.error = '';
	        }
	        break;
	      case 'CallExpression':
	        list = expr.arguments;
	        trailingComma = expr.trailingComma;
	        break;
	      default:
	        list = [expr];
	        break;
	    }
	    for (let i = 0; i < list.length; ++i) {
	      let node = list[i];
	      let param;
	      if (i === list.length - 1 && node.type === 'SpreadExpression') {
	        expr = node.expression;
	        if (trailingComma) this.fail('Trailing comma not allowed after rest parameter', expr);
	        if (expr.type !== 'Identifier') this.fail('Invalid rest parameter', expr);
	        this.checkBindingTarget(expr);
	        node.error = '';
	        param = this.node(new RestParameter(expr), node.start, node.end);
	      } else {
	        param = this.node(new FormalParameter(node, null), node.start, node.end);
	        this.transformPatternElement(param, true);
	      }
	      list[i] = param;
	    }
	    return list;
	  }

	  transformArrayPattern(node, binding) {
	    node.type = 'ArrayPattern';
	    let elems = node.elements;
	    for (let i = 0; i < elems.length; ++i) {
	      let elem = elems[i];
	      if (!elem) continue;
	      switch (elem.type) {
	        case 'SpreadExpression':
	          if (i < elems.length - 1 || node.trailingComma) this.fail('Invalid destructuring pattern', elem);
	          elem = this.node(new PatternRestElement(elem.expression), elem.start, elem.end);
	          this.checkPatternTarget(elem.pattern, binding);
	          break;
	        case 'PatternRestElement':
	          this.checkPatternTarget(elem.pattern, binding);
	          break;
	        case 'PatternElement':
	          this.transformPatternElement(elem, binding);
	          break;
	        default:
	          elem = this.node(new PatternElement(elem, null), elem.start, elem.end);
	          this.transformPatternElement(elem, binding);
	          break;
	      }
	      elems[i] = elem;
	    }
	  }

	  transformObjectPattern(node, binding) {
	    node.type = 'ObjectPattern';
	    let props = node.properties;
	    for (let i = 0; i < props.length; ++i) {
	      let prop = props[i];
	      prop.error = '';
	      switch (prop.type) {
	        case 'PropertyDefinition':
	          prop = this.node(new PatternProperty(prop.name, prop.expression, null), prop.start, prop.end);
	          break;
	        case 'SpreadExpression':
	          if (i < props.length - 1 || node.trailingComma) this.fail('Invalid destructuring pattern', prop);
	          switch (prop.expression.type) {
	            case 'ObjectLiteral':
	            case 'ObjectPattern':
	            case 'ArrayLiteral':
	            case 'ArrayPattern':
	              this.fail('Invalid rest pattern', prop.expression);
	          }
	          prop = this.node(new PatternRestElement(prop.expression), prop.start, prop.end);
	          break;
	        case 'PatternProperty':
	          break;
	        default:
	          this.fail('Invalid pattern', prop);
	      }
	      props[i] = prop;
	      if (prop.pattern) this.transformPatternElement(prop, binding);
	      else this.checkPatternTarget(prop.name, binding);
	    }
	  }

	  transformPatternElement(elem, binding) {
	    let node = elem.pattern;
	    if (node && node.type === 'AssignmentExpression' && node.operator === '=') {
	      elem.initializer = node.right;
	      elem.pattern = node = node.left;
	    }
	    this.checkPatternTarget(node, binding);
	  }

	  transformIdentifier(node) {
	    let value = node.value;
	    if (isReservedWord(value)) this.fail('Unexpected token ' + value, node);
	    this.checkIdentifier(node);
	    node.context = 'variable';
	  }

	  transformDefaultExport(node) {
	    switch (node.type) {
	      case 'ClassExpression':
	        node.type = 'ClassDeclaration';
	        return true;
	      case 'FunctionExpression':
	        node.type = 'FunctionDeclaration';
	        return true;
	    }
	    return false;
	  }
	}

	function isPoisonIdent(name) {
	  return name === 'eval' || name === 'arguments';
	}

	class Validate {
	  checkAssignmentTarget(node, simple) {
	    if (!simple && node.type === 'ParenExpression') {
	      node = this.unwrapParens(node);
	      simple = true;
	    }
	    switch (node.type) {
	      case 'Identifier':
	        if (isPoisonIdent(node.value)) this.addStrictError('Cannot modify ' + node.value + ' in strict mode', node);
	        return;
	      case 'MemberExpression':
	        return;
	      case 'ObjectPattern':
	      case 'ArrayPattern':
	        if (!simple) return;
	        break;
	      case 'ObjectLiteral':
	        if (!simple) {
	          this.transformObjectPattern(node, false);
	          return;
	        }
	        break;
	      case 'ArrayLiteral':
	        if (!simple) {
	          this.transformArrayPattern(node, false);
	          return;
	        }
	        break;
	    }
	    this.fail('Invalid left-hand side in assignment', node);
	  }

	  checkBindingTarget(node) {
	    switch (node.type) {
	      case 'Identifier':
	        {
	          this.checkIdentifier(node);
	          node.context = 'declaration';
	          let name = node.value;
	          if (isPoisonIdent(name)) this.addStrictError(`Binding cannot be created for '${name}' in strict mode`, node);
	          return;
	        }
	      case 'ArrayLiteral':
	      case 'ArrayPattern':
	        this.transformArrayPattern(node, true);
	        return;
	      case 'ObjectLiteral':
	      case 'ObjectPattern':
	        this.transformObjectPattern(node, true);
	        return;
	    }
	    this.fail('Invalid binding target', node);
	  }

	  checkPatternTarget(node, binding) {
	    return binding ? this.checkBindingTarget(node) : this.checkAssignmentTarget(node, false);
	  }

	  checkIdentifier(node) {
	    let ident = node.value;
	    if (ident === 'yield' && this.context.isGenerator) this.fail('yield cannot be an identifier inside of a generator function', node);
	    else if (ident === 'await' && this.context.isAsync) this.fail('await cannot be an identifier inside of an async function', node);
	    else if (isStrictReservedWord(ident)) this.addStrictError(ident + ' cannot be used as an identifier in strict mode', node);
	  }

	  checkParameters(params) {
	    for (let i = 0; i < params.length; ++i) {
	      let node = params[i];
	      if (node.type !== 'FormalParameter' || node.pattern.type !== 'Identifier') {
	        this.context.allowUseStrict = false;
	        continue;
	      }
	      if (node.initializer) this.context.allowUseStrict = false;
	      let name = node.pattern.value;
	      if (isPoisonIdent(name)) this.addStrictError('Parameter name ' + name + ' is not allowed in strict mode', node);
	    }
	  }

	  checkArrowParameters(params) {
	    params = this.transformFormals(params);
	    this.checkParameters(params);
	    return params;
	  }

	  checkForInit(init, iterationType) {
	    if (!init) return;
	    if (!iterationType) {
	      if (init.type !== 'VariableDeclaration') return;
	      init.declarations.forEach((decl) => {
	        if (decl.initializer) return;
	        if (init.kind === 'const') this.fail('Missing const initializer', decl.pattern);
	        if (decl.pattern.type !== 'Identifier') this.fail('Missing pattern initializer', decl.pattern);
	      });
	      return;
	    }
	    if (init.type === 'VariableDeclaration') {
	      if (init.declarations.length !== 1) {
	        this.fail('for-' + iterationType + ' statement may not have more than ' + 'one variable declaration', init);
	      }
	      let decl = init.declarations[0];
	      if (decl.initializer) {
	        let msg = 'Invalid initializer in for-' + iterationType + ' statement';
	        if (iterationType === 'in') this.addStrictError(msg, init);
	        else this.fail(msg);
	      }
	    } else {
	      this.checkAssignmentTarget(this.unwrapParens(init));
	    }
	  }

	  checkInvalidNodes() {
	    let context = this.context;
	    let list = context.invalidNodes;
	    for (let i = 0; i < list.length; ++i) {
	      let item = list[i];
	      let node = item.node;
	      let error = node.error;
	      if (!error) continue;
	      if (item.strict && !context.strict) continue;
	      this.fail(error, node);
	    }
	  }

	  checkMethodExtraction(node) {
	    node = this.unwrapParens(node);
	    if (node.type !== 'MemberExpression') this.fail('Invalid method extraction expression', node);
	  }

	  checkDelete(node) {
	    node = this.unwrapParens(node);
	    if (node.type === 'Identifier') this.addStrictError('Cannot delete unqualified property in strict mode', node);
	  }

	  checkAnnotationTarget(node) {
	    if (node.type === 'ExportDeclaration') {
	      node = node.declaration;
	    }
	    switch (node.type) {
	      case 'ClassDeclaration':
	      case 'FunctionDeclaration':
	      case 'PropertyDefinition':
	      case 'MethodDefinition':
	      case 'ClassField':
	        return node;
	    }
	    this.fail('Invalid annotation target', node);
	  }
	}

	function isIncrement(op) {
	  return op === '++' || op === '--';
	}

	function getPrecedence(op) {
	  switch (op) {
	    case '??':
	      return 1;
	    case '||':
	      return 2;
	    case '&&':
	      return 3;
	    case '|':
	      return 4;
	    case '^':
	      return 5;
	    case '&':
	      return 6;
	    case '==':
	    case '!=':
	    case '===':
	    case '!==':
	      return 7;
	    case '<=':
	    case '>=':
	    case '>':
	    case '<':
	    case 'instanceof':
	    case 'in':
	      return 8;
	    case '>>>':
	    case '>>':
	    case '<<':
	      return 9;
	    case '+':
	    case '-':
	      return 10;
	    case '*':
	    case '/':
	    case '%':
	      return 11;
	    case '**':
	      return 12;
	  }
	  return 0;
	}

	function isAssignment(op) {
	  if (op === '=') return true;
	  switch (op) {
	    case '*=':
	    case '**=':
	    case '&=':
	    case '^=':
	    case '|=':
	    case '<<=':
	    case '>>=':
	    case '>>>=':
	    case '%=':
	    case '+=':
	    case '-=':
	    case '/=':
	      return true;
	  }
	  return false;
	}

	function isUnary(op) {
	  switch (op) {
	    case 'await':
	    case 'delete':
	    case 'void':
	    case 'typeof':
	    case '!':
	    case '~':
	    case '+':
	    case '-':
	    case '&':
	      return true;
	  }
	  return false;
	}

	function isValidMeta(left, right) {
	  switch (left) {
	    case 'new':
	      return right === 'target';
	    case 'import':
	      return right === 'meta';
	  }
	  return false;
	}

	function isDirective(value) {
	  return value === 'use strict';
	}

	function keywordFromToken(token) {
	  if (token.type === 'IDENTIFIER' && token.end - token.start === token.value.length) return token.value;
	  return '';
	}

	function keywordFromNode(node) {
	  if (node.type === 'Identifier' && node.end - node.start === node.value.length) return node.value;
	  return '';
	}

	function copyToken(from, to) {
	  to.type = from.type;
	  to.value = from.value;
	  to.number = from.number;
	  to.numberSuffix = from.numberSuffix;
	  to.regexFlags = from.regexFlags;
	  to.templateEnd = from.templateEnd;
	  to.newlineBefore = from.newlineBefore;
	  to.strictError = from.strictError;
	  to.start = from.start;
	  to.end = from.end;
	  return to;
	}

	class Context {
	  constructor(parent) {
	    this.parent = parent;
	    this.strict = parent && parent.strict || false;
	    this.allowUseStrict = true;
	    this.isFunction = false;
	    this.functionBody = false;
	    this.isGenerator = false;
	    this.isAsync = false;
	    this.isMethod = false;
	    this.allowSuperCall = false;
	    this.hasYieldAwait = false;
	    this.labelMap = null;
	    this.switchDepth = 0;
	    this.loopDepth = 0;
	    this.invalidNodes = [];
	  }
	}

	class ParseResult {
	  constructor(results) {
	    this.input = results.input;
	    this.lineMap = results.lineMap;
	    this.ast = results.ast;
	    this.comments = results.comments;
	    this.annotations = results.annotations;
	  }

	  locate(offset) {
	    return this.lineMap.locate(offset);
	  }
	}

	class Parser {
	  constructor(input, options) {
	    options = options || {};
	    let scanner = new Scanner(input, options.offset);
	    this.onASI = options.onASI || null;
	    this.scanner = scanner;
	    this.input = input;
	    this.peek0 = null;
	    this.peek1 = null;
	    this.tokenStash = new Scanner();
	    this.tokenEnd = scanner.offset;
	    this.context = new Context(null);
	    this.comments = [];
	    this.annotations = new Map();
	  }

	  createParseResult(ast) {
	    return new ParseResult({
	      ast,
	      input: this.input,
	      lineMap: this.scanner.lineMap,
	      comments: this.comments,
	      annotations: this.annotations
	    });
	  }

	  parseModule() {
	    return this.createParseResult(this.Module());
	  }

	  parseScript() {
	    return this.createParseResult(this.Script());
	  }

	  nextToken(context) {
	    context = context || '';
	    let scanner = this.scanner;
	    while (true) {
	      let type = scanner.next(context);
	      if (type === 'COMMENT') this.addComment(scanner);
	      else break;
	    }
	    return scanner;
	  }

	  nodeStart() {
	    if (this.peek0) return this.peek0.start;
	    while (true) {
	      let type = this.scanner.skip();
	      if (type === 'COMMENT') this.addComment(this.scanner);
	      else break;
	    }
	    return this.scanner.offset;
	  }

	  node(node, start, end) {
	    node.start = start;
	    node.end = end === undefined ? this.tokenEnd : end;
	    return node;
	  }

	  addComment(token) {
	    let node = this.node(new Comment(token.value), token.start, token.end);
	    this.comments.push(node);
	  }

	  addAnnotations(node, annotations) {
	    node = this.checkAnnotationTarget(node);
	    this.annotations.set(node, annotations);
	  }

	  readToken(type, context) {
	    let token = this.peek0 || this.nextToken(context);
	    this.peek0 = this.peek1;
	    this.peek1 = null;
	    this.tokenEnd = token.end;
	    if (type && token.type !== type) this.unexpected(token);
	    return token;
	  }

	  read(type, context) {
	    return this.readToken(type, context).type;
	  }

	  peekToken(context) {
	    if (!this.peek0) this.peek0 = this.nextToken(context);
	    return this.peek0;
	  }

	  peek(context) {
	    return this.peekToken(context).type;
	  }

	  peekTokenAt(context, index) {
	    if (index !== 1 || this.peek0 === null) throw new Error('Invalid lookahead');
	    if (this.peek1 === null) {
	      this.peek0 = copyToken(this.peek0, this.tokenStash);
	      this.peek1 = this.nextToken(context);
	    }
	    return this.peek1;
	  }

	  peekAt(context, index) {
	    return this.peekTokenAt(context, index).type;
	  }

	  unpeek() {
	    if (this.peek0) {
	      this.scanner.offset = this.peek0.start;
	      this.peek0 = null;
	      this.peek1 = null;
	    }
	  }

	  peekUntil(type, context) {
	    let tok = this.peek(context);
	    return tok !== 'EOF' && tok !== type ? tok : null;
	  }

	  readKeyword(word) {
	    let token = this.readToken();
	    if (token.type === word || keywordFromToken(token) === word) return token;
	    this.unexpected(token);
	  }

	  peekKeyword(word) {
	    let token = this.peekToken();
	    return token.type === word || keywordFromToken(token) === word;
	  }

	  peekLet() {
	    if (this.peekKeyword('let')) {
	      switch (this.peekAt('div', 1)) {
	        case '{':
	        case '[':
	        case 'IDENTIFIER':
	          return true;
	      }
	    }
	    return false;
	  }

	  peekTrivialExpression() {
	    switch (this.peek()) {
	      case 'null':
	      case 'false':
	      case 'true':
	      case 'this':
	      case 'NUMBER':
	      case 'IDENTIFIER':
	      case 'STRING':
	        switch (this.peekAt('div', 1)) {
	          case ',':
	          case ';':
	          case '}':
	          case ']':
	            return true;
	        }
	    }
	    return false;
	  }

	  peekYield() {
	    return this.context.functionBody && this.context.isGenerator && this.peekKeyword('yield');
	  }

	  peekAwait() {
	    if (this.peekKeyword('await')) {
	      if (this.context.functionBody && this.context.isAsync) return true;
	      if (this.isModule) return true;
	    }
	    return false;
	  }

	  peekAsync() {
	    let token = this.peekToken();
	    if (keywordFromToken(token) !== 'async') return '';
	    token = this.peekTokenAt('div', 1);
	    if (token.newlineBefore) return '';
	    let type = token.type;
	    return type === 'function' || type === '{' ? type : '';
	  }

	  peekExpressionEnd() {
	    let token = this.peekToken();
	    if (!token.newlineBefore) {
	      switch (token.type) {
	        case 'EOF':
	        case '}':
	        case ';':
	          break;
	        case ']':
	        case ')':
	        case 'in':
	        case ',':
	          break;
	        default:
	          return false;
	      }
	    }
	    return true;
	  }

	  unexpected(token) {
	    let type = token.type;
	    let msg;
	    msg = type === 'EOF' ? 'Unexpected end of input' : 'Unexpected token ' + token.type;
	    this.fail(msg, token);
	  }

	  fail(msg, node) {
	    if (!node) node = this.peekToken();
	    let loc = this.scanner.lineMap.locate(node.start);
	    let err = new SyntaxError(msg);
	    err.line = loc.line;
	    err.column = loc.column;
	    err.lineOffset = loc.lineOffset;
	    err.startOffset = node.start;
	    err.endOffset = node.end;
	    throw err;
	  }

	  unwrapParens(node) {
	    for (; node.type === 'ParenExpression'; node = node.expression) ;
	    return node;
	  }

	  pushContext(lexical) {
	    let parent = this.context;
	    let c = new Context(parent);
	    this.context = c;
	    if (lexical) {
	      c.isMethod = parent.isMethod;
	      c.allowSuperCall = parent.allowSuperCall;
	    }
	    return c;
	  }

	  pushMaybeContext() {
	    let parent = this.context;
	    let c = this.pushContext();
	    c.isFunction = parent.isFunction;
	    c.isGenerator = parent.isGenerator;
	    c.isAsync = parent.isAsync;
	    c.isMethod = parent.isMethod;
	    c.allowSuperCall = parent.allowSuperCall;
	    c.functionBody = parent.functionBody;
	  }

	  popContext(collapse) {
	    let context = this.context;
	    let parent = context.parent;
	    if (collapse) context.invalidNodes.forEach((node) => parent.invalidNodes.push(node));
	    else this.checkInvalidNodes();
	    this.context = this.context.parent;
	  }

	  setStrict(strict) {
	    this.context.strict = strict;
	  }

	  addStrictError(error, node) {
	    this.addInvalidNode(error, node, true);
	  }

	  addInvalidNode(error, node, strict) {
	    node.error = error;
	    this.context.invalidNodes.push({
	      node,
	      strict: Boolean(strict)
	    });
	  }

	  setLabel(label, value) {
	    let m = this.context.labelMap;
	    if (!m) m = this.context.labelMap = new Map();
	    m.set(label, value);
	  }

	  getLabel(label) {
	    let m = this.context.labelMap;
	    return (m && m.get(label)) | 0;
	  }

	  setFunctionType(kind) {
	    let c = this.context;
	    let a = false;
	    let g = false;
	    switch (kind) {
	      case 'async':
	        a = true;
	        break;
	      case 'generator':
	        g = true;
	        break;
	      case 'async-generator':
	        a = g = true;
	        break;
	    }
	    c.isFunction = true;
	    c.isAsync = a;
	    c.isGenerator = g;
	  }

	  Script() {
	    this.isModule = false;
	    this.pushContext();
	    let start = this.nodeStart();
	    let statements = this.StatementList(true);
	    this.popContext();
	    return this.node(new Script(statements), start);
	  }

	  Module() {
	    this.isModule = true;
	    this.pushContext();
	    this.setStrict(true);
	    let start = this.nodeStart();
	    let list = this.ModuleItemList();
	    this.popContext();
	    return this.node(new Module(list), start);
	  }

	  Expression(noIn) {
	    let expr = this.AssignmentExpression(noIn);
	    let list = null;
	    while (this.peek('div') === ',') {
	      this.read();
	      if (list === null) expr = this.node(new SequenceExpression(list = [expr]), expr.start);
	      if (this.peek() === ')') {
	        this.addInvalidNode('Invalid trailing comma in sequence expression', expr);
	        break;
	      }
	      list.push(this.AssignmentExpression(noIn));
	    }
	    if (list) expr.end = this.tokenEnd;
	    return expr;
	  }

	  AssignmentExpression(noIn, allowSpread) {
	    let start = this.nodeStart();
	    let node;
	    if (this.peek() === '...') {
	      this.read();
	      node = this.node(new SpreadExpression(this.AssignmentExpression(noIn)), start);
	      if (!allowSpread) this.addInvalidNode('Invalid spread expression', node);
	      return node;
	    }
	    if (this.peekYield()) return this.YieldExpression(noIn);
	    node = this.ConditionalExpression(noIn);
	    if (node.type === 'ArrowFunctionHead') return this.ArrowFunctionBody(node, noIn);
	    if (!isAssignment(this.peek('div'))) return node;
	    this.checkAssignmentTarget(node, false);
	    return this.node(new AssignmentExpression(node, this.read(), this.AssignmentExpression(noIn)), start);
	  }

	  YieldExpression(noIn) {
	    let start = this.nodeStart();
	    let delegate = false;
	    let expr = null;
	    this.readKeyword('yield');
	    if (!this.peekExpressionEnd()) {
	      if (this.peek() === '*') {
	        this.read();
	        delegate = true;
	      }
	      expr = this.AssignmentExpression(noIn);
	    }
	    this.context.hasYieldAwait = true;
	    return this.node(new YieldExpression(expr, delegate), start);
	  }

	  ConditionalExpression(noIn) {
	    if (this.peekTrivialExpression()) return this.PrimaryExpression();
	    let start = this.nodeStart();
	    let left = this.BinaryExpression(noIn);
	    let middle;
	    let right;
	    if (this.peek('div') !== '?') return left;
	    this.read('?');
	    middle = this.AssignmentExpression();
	    this.read(':');
	    right = this.AssignmentExpression(noIn);
	    return this.node(new ConditionalExpression(left, middle, right), start);
	  }

	  BinaryExpression(noIn) {
	    return this.PartialBinaryExpression(this.UnaryExpression(), 0, noIn);
	  }

	  PartialBinaryExpression(lhs, minPrec, noIn) {
	    let prec = 0;
	    let next = '';
	    let max = 0;
	    let op = '';
	    let rhs;
	    while (next = this.peek('div')) {
	      if (next === 'in' && noIn) break;
	      if (next === '**' && lhs.type === 'UnaryExpression') this.fail();
	      prec = getPrecedence(next);
	      if (prec === 0 || prec < minPrec) break;
	      this.read();
	      op = next;
	      max = prec;
	      rhs = this.UnaryExpression();
	      while (next = this.peek('div')) {
	        prec = getPrecedence(next);
	        if (prec === 0 || prec <= max) break;
	        rhs = this.PartialBinaryExpression(rhs, prec, noIn);
	      }
	      lhs = this.node(new BinaryExpression(lhs, op, rhs), lhs.start, rhs.end);
	    }
	    return lhs;
	  }

	  UnaryExpression() {
	    let start = this.nodeStart();
	    let type = this.peek();
	    let token;
	    let expr;
	    if (isIncrement(type)) {
	      this.read();
	      expr = this.MemberExpression(true);
	      this.checkAssignmentTarget(this.unwrapParens(expr), true);
	      return this.node(new UpdateExpression(type, expr, true), start);
	    }
	    if (this.peekAwait()) {
	      type = 'await';
	      this.context.hasYieldAwait = true;
	    }
	    if (isUnary(type)) {
	      this.read();
	      expr = this.UnaryExpression();
	      switch (type) {
	        case 'delete':
	          this.checkDelete(expr);
	          break;
	        case '&':
	          this.checkMethodExtraction(expr);
	          break;
	      }
	      return this.node(new UnaryExpression(type, expr), start);
	    }
	    expr = this.MemberExpression(true);
	    token = this.peekToken('div');
	    type = token.type;
	    if (isIncrement(type) && !token.newlineBefore) {
	      this.read();
	      this.checkAssignmentTarget(this.unwrapParens(expr), true);
	      return this.node(new UpdateExpression(type, expr, false), start);
	    }
	    return expr;
	  }

	  MemberExpression(allowCall) {
	    let token = this.peekToken();
	    let start = token.start;
	    let isSuper = false;
	    let exit = false;
	    let expr;
	    switch (token.type) {
	      case 'super':
	        expr = this.SuperKeyword();
	        isSuper = true;
	        break;
	      case 'new':
	        expr = this.peekAt('', 1) === '.' ? this.MetaProperty() : this.NewExpression();
	        break;
	      case 'import':
	        expr = this.peekAt('', 1) === '.' ? this.MetaProperty() : this.ImportCall();
	        break;
	      default:
	        expr = this.PrimaryExpression();
	        break;
	    }
	    while (!exit) {
	      token = this.peekToken('div');
	      switch (token.type) {
	        case '.':
	          {
	            this.read();
	            let prop = this.peek('name') === 'SYMBOL' ? this.SymbolName() : this.IdentifierName();
	            expr = this.node(new MemberExpression(expr, prop), start);
	            break;
	          }
	        case '[':
	          {
	            let prop = this.ComputedPropertyName();
	            expr = this.node(new MemberExpression(expr, prop), start);
	            break;
	          }
	        case '->':
	          {
	            this.read();
	            let callee = this.MemberExpression(false);
	            this.read('(');
	            let args = this.ArgumentList();
	            let trailingComma = false;
	            if (this.peek() === ',') {
	              this.read();
	              trailingComma = true;
	            }
	            this.read(')');
	            expr = this.node(new CallWithExpression(expr, callee, args, trailingComma), start);
	            break;
	          }
	        case '(':
	          {
	            if (!allowCall) {
	              exit = true;
	              break;
	            }
	            if (isSuper && !this.context.allowSuperCall) this.fail('Invalid super call');
	            let arrowType = '';
	            if (keywordFromNode(expr) === 'async' && !token.newlineBefore) {
	              arrowType = 'async';
	              this.pushMaybeContext();
	            }
	            this.read('(');
	            let args = this.ArgumentList();
	            let trailingComma = false;
	            if (this.peek() === ',') {
	              this.read();
	              trailingComma = true;
	            }
	            this.read(')');
	            expr = this.node(new CallExpression(expr, args, trailingComma), start);
	            if (arrowType) {
	              token = this.peekToken('div');
	              if (token.type === '=>' && !token.newlineBefore) {
	                expr = this.ArrowFunctionHead(arrowType, expr, start);
	                exit = true;
	              } else {
	                this.popContext(true);
	              }
	            }
	            break;
	          }
	        case 'TEMPLATE':
	          if (isSuper) this.fail();
	          expr = this.node(new TaggedTemplateExpression(expr, this.TemplateExpression()), start);
	          break;
	        default:
	          if (isSuper) this.fail();
	          exit = true;
	          break;
	      }
	      isSuper = false;
	    }
	    return expr;
	  }

	  NewExpression() {
	    let start = this.nodeStart();
	    this.read('new');
	    let expr = this.MemberExpression(false);
	    let args = null;
	    let trailingComma = false;
	    if (this.peek('div') === '(') {
	      this.read('(');
	      args = this.ArgumentList();
	      if (this.peek() === ',') {
	        this.read();
	        trailingComma = true;
	      }
	      this.read(')');
	    }
	    if (expr.type === 'SuperKeyword') this.fail('Invalid super keyword', expr);
	    return this.node(new NewExpression(expr, args, trailingComma), start);
	  }

	  MetaProperty() {
	    let token = this.readToken();
	    let start = token.start;
	    let left = token.type === 'IDENTIFIER' ? token.value : token.type;
	    let right;
	    if (left === 'import' && !this.isModule) this.fail('Invalid meta property', token);
	    this.read('.');
	    token = this.readToken('IDENTIFIER', 'name');
	    right = token.value;
	    if (!isValidMeta(left, right)) this.fail('Invalid meta property', token);
	    return this.node(new MetaProperty(left, right), start);
	  }

	  SuperKeyword() {
	    let token = this.readToken('super');
	    let node = this.node(new SuperKeyword(), token.start, token.end);
	    if (!this.context.isMethod) this.fail('Super keyword outside of method', node);
	    return node;
	  }

	  ArgumentList() {
	    let list = [];
	    while (this.peekUntil(')')) {
	      list.push(this.AssignmentExpression(false, true));
	      if (this.peek() === ',') {
	        if (this.peekAt('', 1) === ')') break;
	        this.read();
	      }
	    }
	    return list;
	  }

	  PrimaryExpression() {
	    let token = this.peekToken();
	    let type = token.type;
	    let start = this.nodeStart();
	    let next;
	    let value;
	    switch (type) {
	      case 'function':
	        return this.FunctionExpression();
	      case 'class':
	        return this.ClassExpression();
	      case 'TEMPLATE':
	        return this.TemplateExpression();
	      case 'NUMBER':
	        return this.NumberLiteral();
	      case 'STRING':
	        return this.StringLiteral();
	      case '{':
	        return this.ObjectLiteral();
	      case '(':
	        return this.ParenExpression();
	      case '[':
	        return this.ArrayLiteral();
	      case 'IDENTIFIER':
	        value = keywordFromToken(token);
	        next = this.peekTokenAt('div', 1);
	        if (!next.newlineBefore) {
	          if (next.type === '=>') {
	            this.pushContext(true);
	            return this.ArrowFunctionHead('', this.BindingIdentifier(), start);
	          } else if (next.type === 'function') {
	            return this.FunctionExpression();
	          } else if (value === 'async' && next.type === 'IDENTIFIER') {
	            this.read();
	            this.pushContext(true);
	            let ident = this.BindingIdentifier();
	            next = this.peekToken();
	            if (next.type !== '=>' || next.newlineBefore) this.fail();
	            return this.ArrowFunctionHead(value, ident, start);
	          }
	        }
	        return this.Identifier(true);
	      case 'REGEX':
	        return this.RegularExpression();
	      case 'null':
	        this.read();
	        return this.node(new NullLiteral(), token.start, token.end);
	      case 'true':
	      case 'false':
	        this.read();
	        return this.node(new BooleanLiteral(type === 'true'), token.start, token.end);
	      case 'this':
	        this.read();
	        return this.node(new ThisExpression(), token.start, token.end);
	    }
	    this.unexpected(token);
	  }

	  Identifier(isVar) {
	    let token = this.readToken('IDENTIFIER');
	    let node = this.node(new Identifier(token.value, isVar ? 'variable' : ''), token.start, token.end);
	    this.checkIdentifier(node);
	    return node;
	  }

	  IdentifierName() {
	    let token = this.readToken('IDENTIFIER', 'name');
	    return this.node(new Identifier(token.value, ''), token.start, token.end);
	  }

	  SymbolName() {
	    let token = this.readToken('SYMBOL');
	    return this.node(new SymbolName(token.value), token.start, token.end);
	  }

	  StringLiteral() {
	    let token = this.readToken('STRING');
	    let node = this.node(new StringLiteral(token.value), token.start, token.end);
	    if (token.strictError) this.addStrictError(token.strictError, node);
	    return node;
	  }

	  NumberLiteral() {
	    let token = this.readToken('NUMBER');
	    let node = this.node(new NumberLiteral(token.number, token.numberSuffix), token.start, token.end);
	    if (token.strictError) this.addStrictError(token.strictError, node);
	    return node;
	  }

	  TemplatePart() {
	    let token = this.readToken('TEMPLATE', 'template');
	    let end = token.templateEnd;
	    let node;
	    node = this.node(new TemplatePart(token.value, this.scanner.rawValue(token.start + 1, token.end - (end ? 1 : 2)), end), token.start, token.end);
	    if (token.strictError) this.addStrictError(token.strictError, node);
	    return node;
	  }

	  RegularExpression() {
	    let token = this.readToken('REGEX');
	    return this.node(new RegularExpression(token.value, token.regexFlags), token.start, token.end);
	  }

	  BindingIdentifier() {
	    let token = this.readToken('IDENTIFIER');
	    let node = this.node(new Identifier(token.value, ''), token.start, token.end);
	    this.checkBindingTarget(node);
	    return node;
	  }

	  BindingPattern() {
	    let node;
	    switch (this.peek()) {
	      case '{':
	        node = this.ObjectLiteral();
	        break;
	      case '[':
	        node = this.ArrayLiteral();
	        break;
	      default:
	        return this.BindingIdentifier();
	    }
	    this.checkBindingTarget(node);
	    return node;
	  }

	  ParenExpression() {
	    let start = this.nodeStart();
	    let next = null;
	    this.pushMaybeContext();
	    this.read('(');
	    if (this.peek() === ')') {
	      next = this.peekTokenAt('', 1);
	      if (next.newlineBefore || next.type !== '=>') this.fail();
	      this.read(')');
	      return this.ArrowFunctionHead('', null, start);
	    }
	    let expr = this.Expression();
	    this.read(')');
	    next = this.peekToken('div');
	    if (!next.newlineBefore && next.type === '=>') return this.ArrowFunctionHead('', expr, start);
	    this.popContext(true);
	    return this.node(new ParenExpression(expr), start);
	  }

	  ObjectLiteral() {
	    let start = this.nodeStart();
	    let comma = false;
	    let list = [];
	    let node;
	    this.read('{');
	    while (this.peekUntil('}', 'name')) {
	      if (!comma && node) {
	        this.read(',');
	        comma = true;
	      } else {
	        comma = false;
	        let annotations = this.AnnotationList();
	        node = this.PropertyDefinition();
	        if (annotations) {
	          this.addAnnotations(node, annotations);
	        }
	        list.push(node);
	      }
	    }
	    this.read('}');
	    return this.node(new ObjectLiteral(list, comma), start);
	  }

	  PropertyDefinition() {
	    if (this.peek('name') === '*') return this.MethodDefinition(null, '');
	    let start = this.nodeStart();
	    let node;
	    let name;
	    if (this.peek('name') === '...') {
	      this.read();
	      return this.node(new SpreadExpression(this.AssignmentExpression()), start);
	    }
	    switch (this.peekAt('name', 1)) {
	      case '=':
	        this.unpeek();
	        node = this.node(new PatternProperty(this.Identifier(true), null, (this.read(), this.AssignmentExpression())), start);
	        this.addInvalidNode('Invalid property definition in object literal', node);
	        return node;
	      case ',':
	      case '}':
	        this.unpeek();
	        return this.node(new PropertyDefinition(this.Identifier(true), null), start);
	    }
	    name = this.PropertyName();
	    if (this.peek('name') === ':') {
	      return this.node(new PropertyDefinition(name, (this.read(), this.AssignmentExpression())), start);
	    }
	    return this.MethodDefinition(name, '');
	  }

	  PropertyName() {
	    let token = this.peekToken('name');
	    switch (token.type) {
	      case 'IDENTIFIER':
	        return this.IdentifierName();
	      case 'STRING':
	        return this.StringLiteral();
	      case 'NUMBER':
	        return this.NumberLiteral();
	      case 'SYMBOL':
	        return this.SymbolName();
	      case '[':
	        return this.ComputedPropertyName();
	    }
	    this.unexpected(token);
	  }

	  ComputedPropertyName() {
	    let start = this.nodeStart();
	    this.read('[');
	    let expr = this.AssignmentExpression();
	    this.read(']');
	    return this.node(new ComputedPropertyName(expr), start);
	  }

	  ArrayLiteral() {
	    let start = this.nodeStart();
	    let comma = false;
	    let list = [];
	    let type;
	    this.read('[');
	    while (type = this.peekUntil(']')) {
	      if (type === ',') {
	        this.read();
	        comma = true;
	        list.push(null);
	      } else {
	        list.push(this.AssignmentExpression(false, true));
	        comma = false;
	        if (this.peek() !== ']') {
	          this.read(',');
	          comma = true;
	        }
	      }
	    }
	    this.read(']');
	    return this.node(new ArrayLiteral(list, comma), start);
	  }

	  TemplateExpression() {
	    let atom = this.TemplatePart();
	    let start = atom.start;
	    let parts = [atom];
	    while (!atom.templateEnd) {
	      parts.push(this.Expression());
	      this.unpeek();
	      parts.push(atom = this.TemplatePart());
	    }
	    return this.node(new TemplateExpression(parts), start);
	  }

	  Statement(label) {
	    switch (this.peek()) {
	      case 'IDENTIFIER':
	        if (this.peekAt('div', 1) === ':') return this.LabelledStatement();
	        return this.ExpressionStatement();
	      case '{':
	        return this.Block();
	      case ';':
	        return this.EmptyStatement();
	      case 'var':
	        return this.VariableStatement();
	      case 'return':
	        return this.ReturnStatement();
	      case 'break':
	        return this.BreakStatement();
	      case 'continue':
	        return this.ContinueStatement();
	      case 'throw':
	        return this.ThrowStatement();
	      case 'debugger':
	        return this.DebuggerStatement();
	      case 'if':
	        return this.IfStatement();
	      case 'do':
	        return this.DoWhileStatement(label);
	      case 'while':
	        return this.WhileStatement(label);
	      case 'for':
	        return this.ForStatement(label);
	      case 'with':
	        return this.WithStatement();
	      case 'switch':
	        return this.SwitchStatement();
	      case 'try':
	        return this.TryStatement();
	      default:
	        return this.ExpressionStatement();
	    }
	  }

	  Block() {
	    let start = this.nodeStart();
	    this.read('{');
	    let list = this.StatementList(false);
	    this.read('}');
	    return this.node(new Block(list), start);
	  }

	  Semicolon() {
	    let token = this.peekToken();
	    let type = token.type;
	    if (type === ';') {
	      this.read();
	    } else if (type === '}' || type === 'EOF' || token.newlineBefore) {
	      if (this.onASI && !this.onASI(token)) this.unexpected(token);
	    } else {
	      this.unexpected(token);
	    }
	  }

	  LabelledStatement() {
	    let start = this.nodeStart();
	    let label = this.Identifier();
	    let name = label.value;
	    if (this.getLabel(name) > 0) this.fail('Invalid label', label);
	    this.read(':');
	    this.setLabel(name, 1);
	    let statement;
	    if (this.peek() === 'function') {
	      statement = this.FunctionDeclaration();
	      this.addStrictError('Labeled FunctionDeclarations are disallowed in strict mode', statement);
	    } else {
	      statement = this.Statement(name);
	    }
	    this.setLabel(name, 0);
	    return this.node(new LabelledStatement(label, statement), start);
	  }

	  ExpressionStatement() {
	    let start = this.nodeStart();
	    let expr = this.Expression();
	    this.Semicolon();
	    return this.node(new ExpressionStatement(expr), start);
	  }

	  EmptyStatement() {
	    let start = this.nodeStart();
	    this.Semicolon();
	    return this.node(new EmptyStatement(), start);
	  }

	  VariableStatement() {
	    let node = this.VariableDeclaration(false);
	    this.Semicolon();
	    node.end = this.tokenEnd;
	    return node;
	  }

	  VariableDeclaration(noIn) {
	    let start = this.nodeStart();
	    let token = this.peekToken();
	    let kind = token.type;
	    let list = [];
	    if (kind === 'IDENTIFIER' && token.value === 'let') {
	      kind = 'let';
	    }
	    switch (kind) {
	      case 'var':
	      case 'const':
	      case 'let':
	        break;
	      default:
	        this.fail('Expected var, const, or let');
	    }
	    this.read();
	    while (true) {
	      list.push(this.VariableDeclarator(noIn, kind));
	      if (this.peek() === ',') this.read();
	      else break;
	    }
	    return this.node(new VariableDeclaration(kind, list), start);
	  }

	  VariableDeclarator(noIn, kind) {
	    let start = this.nodeStart();
	    let pattern = this.BindingPattern();
	    let init = null;
	    if ((!noIn && pattern.type !== 'Identifier') || this.peek() === '=') {
	      this.read();
	      init = this.AssignmentExpression(noIn);
	    } else if (!noIn && kind === 'const') {
	      this.fail('Missing const initializer', pattern);
	    }
	    return this.node(new VariableDeclarator(pattern, init), start);
	  }

	  ReturnStatement() {
	    if (!this.context.isFunction) this.fail('Return statement outside of function');
	    let start = this.nodeStart();
	    this.read('return');
	    let value = this.peekExpressionEnd() ? null : this.Expression();
	    this.Semicolon();
	    return this.node(new ReturnStatement(value), start);
	  }

	  BreakStatement() {
	    let start = this.nodeStart();
	    let context = this.context;
	    this.read('break');
	    let label = this.peekExpressionEnd() ? null : this.Identifier();
	    this.Semicolon();
	    let node = this.node(new BreakStatement(label), start);
	    if (label) {
	      if (this.getLabel(label.value) === 0) this.fail('Invalid label', label);
	    } else if (context.loopDepth === 0 && context.switchDepth === 0) {
	      this.fail('Break not contained within a switch or loop', node);
	    }
	    return node;
	  }

	  ContinueStatement() {
	    let start = this.nodeStart();
	    let context = this.context;
	    this.read('continue');
	    let label = this.peekExpressionEnd() ? null : this.Identifier();
	    this.Semicolon();
	    let node = this.node(new ContinueStatement(label), start);
	    if (label) {
	      if (this.getLabel(label.value) !== 2) this.fail('Invalid label', label);
	    } else if (context.loopDepth === 0) {
	      this.fail('Continue not contained within a loop', node);
	    }
	    return node;
	  }

	  ThrowStatement() {
	    let start = this.nodeStart();
	    this.read('throw');
	    let expr = this.peekExpressionEnd() ? null : this.Expression();
	    if (expr === null) this.fail('Missing throw expression');
	    this.Semicolon();
	    return this.node(new ThrowStatement(expr), start);
	  }

	  DebuggerStatement() {
	    let start = this.nodeStart();
	    this.read('debugger');
	    this.Semicolon();
	    return this.node(new DebuggerStatement(), start);
	  }

	  IfStatement() {
	    let start = this.nodeStart();
	    this.read('if');
	    this.read('(');
	    let test = this.Expression();
	    let body = null;
	    let elseBody = null;
	    this.read(')');
	    body = this.Statement();
	    if (this.peek() === 'else') {
	      this.read();
	      elseBody = this.Statement();
	    }
	    return this.node(new IfStatement(test, body, elseBody), start);
	  }

	  DoWhileStatement(label) {
	    let start = this.nodeStart();
	    let body;
	    let test;
	    if (label) this.setLabel(label, 2);
	    this.read('do');
	    this.context.loopDepth += 1;
	    body = this.Statement();
	    this.context.loopDepth -= 1;
	    this.read('while');
	    this.read('(');
	    test = this.Expression();
	    this.read(')');
	    return this.node(new DoWhileStatement(body, test), start);
	  }

	  WhileStatement(label) {
	    let start = this.nodeStart();
	    if (label) this.setLabel(label, 2);
	    this.read('while');
	    this.read('(');
	    let expr = this.Expression();
	    this.read(')');
	    this.context.loopDepth += 1;
	    let statement = this.Statement();
	    this.context.loopDepth -= 1;
	    return this.node(new WhileStatement(expr, statement), start);
	  }

	  ForStatement(label) {
	    let start = this.nodeStart();
	    let init = null;
	    let async = false;
	    let test;
	    let step;
	    if (label) this.setLabel(label, 2);
	    this.read('for');
	    if (this.peekAwait()) {
	      this.read();
	      async = true;
	    }
	    this.read('(');
	    switch (this.peek()) {
	      case ';':
	        break;
	      case 'var':
	      case 'const':
	        init = this.VariableDeclaration(true);
	        break;
	      case 'IDENTIFIER':
	        init = this.peekLet() ? this.VariableDeclaration(true) : this.Expression(true);
	        break;
	      default:
	        init = this.Expression(true);
	        break;
	    }
	    if (async || init && this.peekKeyword('of')) return this.ForOfStatement(async, init, start);
	    if (init && this.peek() === 'in') return this.ForInStatement(init, start);
	    this.checkForInit(init, '');
	    this.read(';');
	    test = this.peek() === ';' ? null : this.Expression();
	    this.read(';');
	    step = this.peek() === ')' ? null : this.Expression();
	    this.read(')');
	    this.context.loopDepth += 1;
	    let statement = this.Statement();
	    this.context.loopDepth -= 1;
	    return this.node(new ForStatement(init, test, step, statement), start);
	  }

	  ForInStatement(init, start) {
	    this.checkForInit(init, 'in');
	    this.read('in');
	    let expr = this.Expression();
	    this.read(')');
	    this.context.loopDepth += 1;
	    let statement = this.Statement();
	    this.context.loopDepth -= 1;
	    return this.node(new ForInStatement(init, expr, statement), start);
	  }

	  ForOfStatement(async, init, start) {
	    this.checkForInit(init, 'of');
	    this.readKeyword('of');
	    let expr = this.AssignmentExpression();
	    this.read(')');
	    this.context.loopDepth += 1;
	    let statement = this.Statement();
	    this.context.loopDepth -= 1;
	    return this.node(new ForOfStatement(async, init, expr, statement), start);
	  }

	  WithStatement() {
	    let start = this.nodeStart();
	    this.read('with');
	    this.read('(');
	    let node = this.node(new WithStatement(this.Expression(), (this.read(')'), this.Statement())), start);
	    this.addStrictError('With statement is not allowed in strict mode', node);
	    return node;
	  }

	  SwitchStatement() {
	    let start = this.nodeStart();
	    this.read('switch');
	    this.read('(');
	    let head = this.Expression();
	    let hasDefault = false;
	    let cases = [];
	    let node;
	    this.read(')');
	    this.read('{');
	    this.context.switchDepth += 1;
	    while (this.peekUntil('}')) {
	      node = this.SwitchCase();
	      if (node.test === null) {
	        if (hasDefault) this.fail('Switch statement cannot have more than one default', node);
	        hasDefault = true;
	      }
	      cases.push(node);
	    }
	    this.context.switchDepth -= 1;
	    this.read('}');
	    return this.node(new SwitchStatement(head, cases), start);
	  }

	  SwitchCase() {
	    let start = this.nodeStart();
	    let expr = null;
	    let list = [];
	    let type;
	    if (this.peek() === 'default') {
	      this.read();
	    } else {
	      this.read('case');
	      expr = this.Expression();
	    }
	    this.read(':');
	    while (type = this.peekUntil('}')) {
	      if (type === 'case' || type === 'default') break;
	      list.push(this.StatementListItem());
	    }
	    return this.node(new SwitchCase(expr, list), start);
	  }

	  TryStatement() {
	    let start = this.nodeStart();
	    this.read('try');
	    let tryBlock = this.Block();
	    let handler = null;
	    let fin = null;
	    if (this.peek() === 'catch') handler = this.CatchClause();
	    if (this.peek() === 'finally') {
	      this.read('finally');
	      fin = this.Block();
	    }
	    return this.node(new TryStatement(tryBlock, handler, fin), start);
	  }

	  CatchClause() {
	    let start = this.nodeStart();
	    let param = null;
	    this.read('catch');
	    if (this.peek() === '(') {
	      this.read('(');
	      param = this.BindingPattern();
	      this.read(')');
	    }
	    return this.node(new CatchClause(param, this.Block()), start);
	  }

	  StatementList(prologue) {
	    let list = [];
	    let node;
	    let expr;
	    let dir;
	    while (this.peekUntil('}')) {
	      let annotations = this.AnnotationList();
	      node = this.StatementListItem();
	      if (annotations) {
	        this.addAnnotations(node, annotations);
	      }
	      if (prologue) {
	        if (node.type === 'ExpressionStatement' && node.expression.type === 'StringLiteral') {
	          expr = node.expression;
	          dir = this.input.slice(expr.start + 1, expr.end - 1);
	          if (isDirective(dir)) {
	            node = this.node(new Directive(dir, expr), node.start, node.end);
	            if (dir === 'use strict') {
	              if (!this.context.allowUseStrict) this.fail('Invalid "use strict" directive', node);
	              this.setStrict(true);
	            }
	          }
	        } else {
	          prologue = false;
	        }
	      }
	      list.push(node);
	    }
	    return list;
	  }

	  StatementListItem() {
	    switch (this.peek()) {
	      case 'function':
	        return this.FunctionDeclaration();
	      case 'class':
	        return this.ClassDeclaration();
	      case 'const':
	        return this.LexicalDeclaration();
	      case 'IDENTIFIER':
	        if (this.peekLet()) return this.LexicalDeclaration();
	        if (this.peekAsync() === 'function') {
	          return this.FunctionDeclaration();
	        }
	        break;
	    }
	    return this.Statement();
	  }

	  LexicalDeclaration() {
	    let node = this.VariableDeclaration(false);
	    this.Semicolon();
	    node.end = this.tokenEnd;
	    return node;
	  }

	  FunctionDeclaration() {
	    let start = this.nodeStart();
	    let kind = '';
	    let token = this.peekToken();
	    if (keywordFromToken(token) === 'async') {
	      this.read();
	      kind = 'async';
	    }
	    this.read('function');
	    if (this.peek() === '*') {
	      this.read();
	      kind = kind ? kind + '-generator' : 'generator';
	    }
	    this.pushContext();
	    this.setFunctionType(kind);
	    let ident = this.BindingIdentifier();
	    let params = this.FormalParameters();
	    let body = this.FunctionBody();
	    this.popContext();
	    return this.node(new FunctionDeclaration(kind, ident, params, body), start);
	  }

	  FunctionExpression() {
	    let start = this.nodeStart();
	    let ident = null;
	    let kind = '';
	    let token;
	    token = this.peekToken();
	    if (keywordFromToken(token) === 'async') {
	      this.read();
	      kind = 'async';
	    }
	    this.read('function');
	    if (this.peek() === '*') {
	      this.read();
	      kind = kind ? kind + '-generator' : 'generator';
	    }
	    this.pushContext();
	    this.setFunctionType(kind);
	    if (this.peek() !== '(') ident = this.BindingIdentifier();
	    let params = this.FormalParameters();
	    let body = this.FunctionBody();
	    this.popContext();
	    return this.node(new FunctionExpression(kind, ident, params, body), start);
	  }

	  MethodDefinition(name, kind, classKind) {
	    let start = name ? name.start : this.nodeStart();
	    if (!name && this.peek('name') === '*') {
	      this.read();
	      kind = 'generator';
	      name = this.PropertyName();
	    } else {
	      if (!name) name = this.PropertyName();
	      let val = keywordFromNode(name);
	      let next = this.peekToken('name');
	      switch (next.type) {
	        case ';':
	        case '}':
	        case '=':
	          return this.ClassField(name);
	      }
	      if (next.type !== '(') {
	        if (val === 'get' || val === 'set') {
	          kind = name.value;
	          name = this.PropertyName();
	        } else if (val === 'async' && !next.newlineBefore) {
	          if (next.type === '*') {
	            this.read();
	            kind = 'async-generator';
	          } else {
	            kind = 'async';
	          }
	          name = this.PropertyName();
	        } else if (classKind && next.newlineBefore) {
	          return this.ClassField(name);
	        }
	      }
	    }
	    this.pushContext();
	    this.context.isMethod = true;
	    this.setFunctionType(kind);
	    if (kind === 'constructor' && classKind === 'derived') this.context.allowSuperCall = true;
	    let params = kind === 'get' || kind === 'set' ? this.AccessorParameters(kind) : this.FormalParameters();
	    let body = this.FunctionBody();
	    this.popContext();
	    return this.node(new MethodDefinition(false, kind, name, params, body), start);
	  }

	  AccessorParameters(kind) {
	    let list = [];
	    this.read('(');
	    if (kind === 'set') list.push(this.FormalParameter(false));
	    this.read(')');
	    this.checkParameters(list);
	    return list;
	  }

	  FormalParameters() {
	    let list = [];
	    this.read('(');
	    while (this.peekUntil(')')) {
	      if (this.peek() === '...') {
	        list.push(this.RestParameter());
	        break;
	      }
	      list.push(this.FormalParameter(true));
	      if (this.peek() !== ')') this.read(',');
	    }
	    this.read(')');
	    this.checkParameters(list);
	    return list;
	  }

	  FormalParameter(allowDefault) {
	    let start = this.nodeStart();
	    let pattern = this.BindingPattern();
	    let init = null;
	    if (allowDefault && this.peek() === '=') {
	      this.read();
	      init = this.AssignmentExpression();
	    }
	    return this.node(new FormalParameter(pattern, init), start);
	  }

	  RestParameter() {
	    let start = this.nodeStart();
	    this.read('...');
	    return this.node(new RestParameter(this.BindingPattern()), start);
	  }

	  FunctionBody() {
	    this.context.functionBody = true;
	    let start = this.nodeStart();
	    this.read('{');
	    let statements = this.StatementList(true);
	    this.read('}');
	    return this.node(new FunctionBody(statements), start);
	  }

	  ArrowFunctionHead(kind, params, start) {
	    this.setFunctionType(kind);
	    if (this.context.hasYieldAwait) this.fail('Invalid yield or await within arrow function head');
	    let formals = this.checkArrowParameters(params);
	    return this.node(new ArrowFunctionHead(formals), start);
	  }

	  ArrowFunctionBody(head, noIn) {
	    this.read('=>');
	    let params = head.parameters;
	    let start = head.start;
	    let kind = this.context.isAsync ? 'async' : '';
	    this.context.functionBody = true;
	    let body = this.peek() === '{' ? this.FunctionBody() : this.AssignmentExpression(noIn);
	    this.popContext();
	    return this.node(new ArrowFunction(kind, params, body), start);
	  }

	  ClassDeclaration() {
	    let start = this.nodeStart();
	    let kind = 'base';
	    let ident = null;
	    let base = null;
	    this.read('class');
	    ident = this.BindingIdentifier();
	    if (this.peek() === 'extends') {
	      this.read();
	      kind = 'derived';
	      base = this.MemberExpression(true);
	    }
	    return this.node(new ClassDeclaration(ident, base, this.ClassBody(kind)), start);
	  }

	  ClassExpression() {
	    let start = this.nodeStart();
	    let kind = 'base';
	    let ident = null;
	    let base = null;
	    this.read('class');
	    if (this.peek() === 'IDENTIFIER') ident = this.BindingIdentifier();
	    if (this.peek() === 'extends') {
	      this.read();
	      kind = 'derived';
	      base = this.MemberExpression(true);
	    }
	    return this.node(new ClassExpression(ident, base, this.ClassBody(kind)), start);
	  }

	  ClassBody(classKind) {
	    let start = this.nodeStart();
	    let hasConstructor = false;
	    let list = [];
	    this.pushContext(true);
	    this.setStrict(true);
	    this.read('{');
	    while (this.peekUntil('}', 'name')) {
	      let annotations = this.AnnotationList();
	      let elem = this.ClassElement(classKind);
	      if (annotations) {
	        this.addAnnotations(elem, annotations);
	      }
	      switch (elem.type) {
	        case 'MethodDefinition':
	          if (elem.kind === 'constructor') {
	            if (hasConstructor) this.fail('Duplicate constructor definitions', elem.name);
	            hasConstructor = true;
	          }
	          break;
	      }
	      list.push(elem);
	    }
	    this.read('}');
	    this.popContext();
	    return this.node(new ClassBody(list), start);
	  }

	  EmptyClassElement() {
	    let start = this.nodeStart();
	    this.read(';');
	    return this.node(new EmptyClassElement(), start);
	  }

	  ClassElement(classKind) {
	    let token = this.peekToken('name');
	    let start = token.start;
	    let isStatic = false;
	    if (token.type === ';') return this.EmptyClassElement();
	    if (token.type === 'IDENTIFIER' && token.value === 'static') {
	      switch (this.peekAt('name', 1)) {
	        case 'IDENTIFIER':
	        case '[':
	          this.read();
	          token = this.peekToken('name');
	          isStatic = true;
	          break;
	      }
	    }
	    let kind = '';
	    let name = null;
	    if (token.type === 'IDENTIFIER' || token.type === '[') {
	      name = this.PropertyName();
	      if (!isStatic && name.type === 'Identifier' && name.value === 'constructor') kind = 'constructor';
	    }
	    let method = this.MethodDefinition(name, kind, classKind);
	    name = method.name;
	    if (name.type === 'Identifier') {
	      let invalid;
	      if (isStatic) {
	        invalid = name.value === 'prototype' || name.value === 'constructor' && method.type === 'ClassField';
	      } else {
	        invalid = name.value === 'constructor' && method.kind !== 'constructor';
	      }
	      if (invalid) this.fail('Invalid ' + name.value + ' property in class definition', name);
	    }
	    method.start = start;
	    method.static = isStatic;
	    return method;
	  }

	  ClassField(name) {
	    let init = null;
	    if (this.peek('name') === '=') {
	      this.read();
	      init = this.AssignmentExpression(false);
	    }
	    this.Semicolon();
	    return this.node(new ClassField(false, name, init), name.start);
	  }

	  ModuleItemList() {
	    let list = [];
	    while (this.peekUntil('EOF')) {
	      let annotations = this.AnnotationList();
	      let node;
	      switch (this.peek()) {
	        case 'import':
	          switch (this.peekAt('', 1)) {
	            case '(':
	            case '.':
	              node = this.StatementListItem();
	              break;
	            default:
	              node = this.ImportDeclaration();
	              break;
	          }
	          break;
	        case 'export':
	          node = this.ExportDeclaration();
	          break;
	        default:
	          node = this.StatementListItem();
	          break;
	      }
	      if (annotations) {
	        this.addAnnotations(node, annotations);
	      }
	      list.push(node);
	    }
	    return list;
	  }

	  ImportCall() {
	    let start = this.nodeStart();
	    this.read('import');
	    this.read('(');
	    let argument = this.AssignmentExpression();
	    this.read(')');
	    return this.node(new ImportCall(argument), start);
	  }

	  ImportDeclaration() {
	    let start = this.nodeStart();
	    let imports = null;
	    let from;
	    this.read('import');
	    switch (this.peek()) {
	      case '*':
	        imports = this.NamespaceImport();
	        break;
	      case '{':
	        imports = this.NamedImports();
	        break;
	      case 'STRING':
	        from = this.StringLiteral();
	        break;
	      default:
	        imports = this.DefaultImport();
	        break;
	    }
	    if (!from) {
	      this.readKeyword('from');
	      from = this.StringLiteral();
	    }
	    this.Semicolon();
	    return this.node(new ImportDeclaration(imports, from), start);
	  }

	  DefaultImport() {
	    let start = this.nodeStart();
	    let ident = this.BindingIdentifier();
	    let extra = null;
	    if (this.peek() === ',') {
	      this.read();
	      switch (this.peek()) {
	        case '*':
	          extra = this.NamespaceImport();
	          break;
	        case '{':
	          extra = this.NamedImports();
	          break;
	        default:
	          this.fail();
	      }
	    }
	    return this.node(new DefaultImport(ident, extra), start);
	  }

	  NamespaceImport() {
	    let start = this.nodeStart();
	    let ident;
	    this.read('*');
	    this.readKeyword('as');
	    ident = this.BindingIdentifier();
	    return this.node(new NamespaceImport(ident), start);
	  }

	  NamedImports() {
	    let start = this.nodeStart();
	    let list = [];
	    this.read('{');
	    while (this.peekUntil('}')) {
	      list.push(this.ImportSpecifier());
	      if (this.peek() === ',') this.read();
	    }
	    this.read('}');
	    return this.node(new NamedImports(list), start);
	  }

	  ImportSpecifier() {
	    let start = this.nodeStart();
	    let hasLocal = false;
	    let local = null;
	    let remote;
	    if (this.peek() !== 'IDENTIFIER') {
	      this.unpeek();
	      remote = this.IdentifierName();
	      hasLocal = true;
	    } else {
	      remote = this.Identifier();
	      hasLocal = this.peekKeyword('as');
	    }
	    if (hasLocal) {
	      this.readKeyword('as');
	      local = this.BindingIdentifier();
	    } else {
	      this.checkBindingTarget(remote);
	    }
	    return this.node(new ImportSpecifier(remote, local), start);
	  }

	  ExportDeclaration() {
	    let start = this.nodeStart();
	    let decl;
	    this.read('export');
	    switch (this.peek()) {
	      case 'default':
	        return this.ExportDefault(start);
	      case '*':
	        return this.ExportNamespace(start);
	      case '{':
	        return this.ExportNameList(start);
	      case 'var':
	      case 'const':
	        decl = this.LexicalDeclaration();
	        break;
	      case 'function':
	        decl = this.FunctionDeclaration();
	        break;
	      case 'class':
	        decl = this.ClassDeclaration();
	        break;
	      case 'IDENTIFIER':
	        if (this.peekLet()) decl = this.LexicalDeclaration();
	        else if (this.peekAsync() === 'function') decl = this.FunctionDeclaration();
	        else return this.ExportDefaultFrom(start);
	        break;
	      default:
	        this.fail();
	    }
	    return this.node(new ExportDeclaration(decl), start);
	  }

	  ExportDefault(start) {
	    let binding;
	    this.read('default');
	    switch (this.peek()) {
	      case 'class':
	        binding = this.ClassExpression();
	        break;
	      case 'function':
	        binding = this.FunctionExpression();
	        break;
	      case 'IDENTIFIER':
	        binding = this.peekAsync() === 'function' ? this.FunctionExpression() : this.AssignmentExpression();
	        break;
	      default:
	        binding = this.AssignmentExpression();
	        break;
	    }
	    let isDecl = this.transformDefaultExport(binding);
	    if (!isDecl) this.Semicolon();
	    return this.node(new ExportDefault(binding), start);
	  }

	  ExportNameList(start) {
	    let list = [];
	    let from = null;
	    this.read('{');
	    while (this.peekUntil('}', 'name')) {
	      list.push(this.ExportSpecifier());
	      if (this.peek() === ',') this.read();
	    }
	    this.read('}');
	    if (this.peekKeyword('from')) {
	      this.read();
	      from = this.StringLiteral();
	    } else {
	      list.forEach((node) => this.transformIdentifier(node.local));
	    }
	    this.Semicolon();
	    return this.node(new ExportNameList(list, from), start);
	  }

	  ExportDefaultFrom(start) {
	    let name = this.Identifier();
	    this.readKeyword('from');
	    let from = this.StringLiteral();
	    this.Semicolon();
	    return this.node(new ExportDefaultFrom(name, from), start);
	  }

	  ExportNamespace(start) {
	    let ident = null;
	    this.read('*');
	    if (this.peekKeyword('as')) {
	      this.read();
	      ident = this.BindingIdentifier();
	    }
	    this.readKeyword('from');
	    let from = this.StringLiteral();
	    this.Semicolon();
	    return this.node(new ExportNamespace(ident, from), start);
	  }

	  ExportSpecifier() {
	    let start = this.nodeStart();
	    let local = this.IdentifierName();
	    let remote = null;
	    if (this.peekKeyword('as')) {
	      this.read();
	      remote = this.IdentifierName();
	    }
	    return this.node(new ExportSpecifier(local, remote), start);
	  }

	  AnnotationList() {
	    if (this.peek() !== '#') {
	      return null;
	    }
	    let list = [];
	    while (this.peek() === '#') {
	      list.push(this.Annotation());
	    }
	    return list;
	  }

	  Annotation() {
	    let start = this.nodeStart();
	    let list = [];
	    this.read();
	    this.read('[');
	    while (this.peekUntil(']')) {
	      list.push(this.Expression());
	      if (this.peek() === ',') this.read();
	      else break;
	    }
	    this.read(']');
	    return this.node(new Annotation(list), start);
	  }
	}

	function mixin(target, ...sources) {
	  target = target.prototype;
	  let {
	    getOwnPropertyNames: ownNames,
	    getOwnPropertyDescriptor: ownDesc,
	    prototype: {
	      hasOwnProperty: hasOwn
	    }
	  } = Object;
	  sources.map((source) => source.prototype).forEach((source) => ownNames(source).filter((key) => !hasOwn.call(target, key)).forEach((key) => Object.defineProperty(target, key, ownDesc(source, key))));
	}

	mixin(Parser, Transform, Validate);
	const SPACE = {};
	const NEWLINE = {};
	const INDENT = {};
	const OUTDENT = {};

	class PrintResult {
	  constructor(output, mappings) {
	    this.output = output;
	    this.mappings = mappings;
	  }
	}

	class Printer {
	  constructor() {
	    this.indentWidth = 2;
	    this.depth = 0;
	    this.stringDelimiter = '\'';
	    this.output = '';
	    this.inputLineMap = null;
	    this.inputStart = 0;
	    this.mappings = [];
	    this.currentLine = 0;
	    this.currentLineOffset = 0;
	  }

	  addMapping(node) {
	    if (typeof node.start !== 'number' || node.start < 0 || node.start === this.inputStart) return;
	    this.inputStart = node.start;
	    let original = this.inputLineMap.locate(this.inputStart);
	    let generated = {
	      line: this.currentLine,
	      column: this.output.length - this.currentLineOffset,
	      lineOffset: this.currentLineOffset
	    };
	    this.mappings.push({ original, generated });
	  }

	  newline(count = 1) {
	    while (count > 0) {
	      this.output += '\n';
	      this.currentLine += 1;
	      count -= 1;
	    }
	    this.currentLineOffset = this.output.length;
	    if (this.indentWidth > 0) this.output += ' '.repeat(this.indentWidth * this.depth);
	  }

	  print(ast, options = {}) {
	    this.output = '';
	    this.inputLineMap = options.lineMap || new LineMap();
	    this.printNode(ast);
	    return new PrintResult(this.output, this.mappings);
	  }

	  printNode(node) {
	    if (node !== null && node !== undefined) {
	      this.addMapping(node);
	      let method = this[node.type];
	      if (!method) {
	        throw new Error(`Missing method for ${node.type}`);
	      }
	      method.call(this, node);
	    }
	  }

	  escapeString(value) {
	    return value.replace(/['"\\\b\f\n\r\t\v\u2028\u2029]/g, (c) => {
	      switch (c) {
	        case '"':
	        case '\'':
	          return c === this.stringDelimiter ? '\\' + c : c;
	        case '\\':
	          return '\\\\';
	        case '\b':
	          return '\\b';
	        case '\f':
	          return '\\f';
	        case '\n':
	          return '\\n';
	        case '\r':
	          return '\\r';
	        case '\t':
	          return '\\t';
	        case '\v':
	          return '\\v';
	        case '\u2028':
	          return '\\u2028';
	        case '\u2029':
	          return '\\u2029';
	      }
	    });
	  }

	  escapeRegexp(value) {
	    return value.replace(/([^\\])\//g, '$1\\/');
	  }

	  write(...args) {
	    for (let i = 0; i < args.length; ++i) {
	      switch (args[i]) {
	        case SPACE:
	          this.output += ' ';
	          this.outputColumn += 1;
	          break;
	        case NEWLINE:
	          this.newline();
	          break;
	        case INDENT:
	          this.depth += 1;
	          this.newline();
	          break;
	        case OUTDENT:
	          this.depth -= 1;
	          this.newline();
	          break;
	        default:
	          if (typeof args[i] === 'string') this.output += args[i];
	          else this.printNode(args[i]);
	          break;
	      }
	    }
	  }

	  writeList(list, sep) {
	    let prev = null;
	    for (let i = 0; i < list.length; ++i) {
	      let node = list[i];
	      if (i > 0) {
	        if (typeof sep === 'function') sep(node, prev);
	        else if (sep === undefined) this.write(',', SPACE);
	        else if (Array.isArray(sep)) this.write(...sep);
	        else this.write(sep);
	      }
	      this.printNode(node);
	      if (node && node.type === 'VariableDeclaration') this.write(';');
	      prev = node;
	    }
	  }

	  isClassOrFunction(node) {
	    switch (node.type) {
	      case 'ExportDeclaration':
	        node = node.declaration;
	        break;
	      case 'ExportDefault':
	        node = node.binding;
	        break;
	    }
	    switch (node.type) {
	      case 'FunctionDeclaration':
	      case 'ClassDeclaration':
	        return true;
	      default:
	        return false;
	    }
	  }

	  writeStatements(list) {
	    this.writeList(list, (node, prev) => {
	      let extra = (this.isClassOrFunction(node) || this.isClassOrFunction(prev) || prev.type === 'Directive');
	      this.newline(extra ? 2 : 1);
	    });
	  }

	  Identifier(node) {
	    this.write(node.value);
	  }

	  NumberLiteral(node) {
	    this.write(String(node.value), node.suffix);
	  }

	  StringLiteral(node) {
	    this.write(this.stringDelimiter, this.escapeString(node.value), this.stringDelimiter);
	  }

	  TemplatePart(node) {
	    this.write(typeof node.raw === 'string' ? node.raw : node.value);
	  }

	  RegularExpression(node) {
	    this.write('/', this.escapeRegexp(node.value), '/', node.flags);
	  }

	  BooleanLiteral(node) {
	    this.write(node.value ? 'true' : 'false');
	  }

	  NullLiteral() {
	    this.write('null');
	  }

	  Script(node) {
	    this.writeStatements(node.statements);
	  }

	  Module(node) {
	    this.writeStatements(node.statements, NEWLINE);
	  }

	  ThisExpression() {
	    this.write('this');
	  }

	  SuperKeyword() {
	    this.write('super');
	  }

	  SequenceExpression(node) {
	    this.writeList(node.expressions);
	  }

	  AssignmentExpression(node) {
	    this.write(node.left, SPACE, node.operator, SPACE, node.right);
	  }

	  SpreadExpression(node) {
	    this.write('...', node.expression);
	  }

	  YieldExpression(node) {
	    this.write('yield');
	    if (node.delegate) this.write(SPACE, '*');
	    this.write(SPACE, node.expression);
	  }

	  ConditionalExpression(node) {
	    this.write(node.test, SPACE, '?', SPACE, node.consequent, SPACE, ':', SPACE, node.alternate);
	  }

	  BinaryExpression(node) {
	    this.write(node.left, SPACE, node.operator, node.right.type === 'RegularExpression' ? ' ' : SPACE, node.right);
	  }

	  UpdateExpression(node) {
	    if (node.prefix) this.write(node.operator, node.expression);
	    else this.write(node.expression, node.operator);
	  }

	  UnaryExpression(node) {
	    this.write(node.operator);
	    if (node.operator.length > 1) this.write(' ');
	    this.write(node.expression);
	  }

	  MemberExpression(node) {
	    this.write(node.object);
	    if (node.property.type === 'Identifier') this.write('.');
	    this.write(node.property);
	  }

	  MetaProperty(node) {
	    this.write(node.left, '.', node.right);
	  }

	  CallExpression(node) {
	    this.write(node.callee, '(');
	    this.writeList(node.arguments);
	    this.write(')');
	  }

	  TemplateExpression(node) {
	    this.write('`');
	    node.parts.forEach((part) => {
	      part.type === 'TemplatePart' ? this.write(part) : this.write('${', part, '}');
	    });
	    this.write('`');
	  }

	  TaggedTemplateExpression(node) {
	    this.write(node.tag, node.template);
	  }

	  NewExpression(node) {
	    this.write('new ', node.callee);
	    if (node.arguments) {
	      this.write('(');
	      this.writeList(node.arguments);
	      this.write(')');
	    }
	  }

	  ParenExpression(node) {
	    this.write('(', node.expression, ')');
	  }

	  ObjectLiteral(node) {
	    let props = node.properties;
	    if (props.length === 0) {
	      this.write('{}');
	    } else if (props.every((p) => p.type === 'PropertyDefinition' && !p.expression)) {
	      this.write('{ ');
	      this.writeList(props, ', ');
	      this.write(' }');
	    } else {
	      this.write('{', INDENT);
	      this.writeList(props, [',', NEWLINE]);
	      this.write(OUTDENT, '}');
	    }
	  }

	  ComputedPropertyName(node) {
	    this.write('[', node.expression, ']');
	  }

	  PropertyDefinition(node) {
	    this.write(node.name);
	    if (node.expression) {
	      this.write(':', SPACE, node.expression);
	    }
	  }

	  ObjectPattern(node) {
	    let props = node.properties;
	    if (props.length === 0) {
	      this.write('{}');
	    } else if (props.every((p) => p.type === 'PatternProperty' && !p.pattern)) {
	      this.write('{ ');
	      this.writeList(props);
	      this.write(' }');
	    } else {
	      this.write('{', INDENT);
	      this.writeList(props, [',', NEWLINE]);
	      this.write(OUTDENT, '}');
	    }
	  }

	  PatternProperty(node) {
	    this.write(node.name);
	    if (node.pattern) this.write(':', SPACE, node.pattern);
	    if (node.initializer) this.write(SPACE, '=', SPACE, node.initializer);
	  }

	  ArrayPattern(node) {
	    this.write('[');
	    this.writeList(node.elements);
	    this.write(']');
	  }

	  PatternElement(node) {
	    this.write(node.pattern);
	    if (node.initializer) this.write(SPACE, '=', SPACE, node.initializer);
	  }

	  PatternRestElement(node) {
	    this.write('...', node.pattern);
	  }

	  MethodDefinition(node) {
	    if (node.static) this.write('static ');
	    switch (node.kind) {
	      case 'generator':
	        this.write('*');
	        break;
	      case 'async':
	        this.write('async ');
	        break;
	      case 'async-generator':
	        this.write('async *');
	        break;
	      case 'get':
	        this.write('get ');
	        break;
	      case 'set':
	        this.write('set ');
	        break;
	    }
	    this.write(node.name, '(');
	    this.writeList(node.params);
	    this.write(')', SPACE, node.body);
	  }

	  ArrayLiteral(node) {
	    this.write('[');
	    this.writeList(node.elements);
	    this.write(']');
	  }

	  Block(node) {
	    if (node.statements.length === 0) {
	      this.write('{}');
	    } else {
	      this.write('{', INDENT);
	      this.writeStatements(node.statements);
	      this.write(OUTDENT, '}');
	    }
	  }

	  LabelledStatement(node) {
	    this.write(node.label, ':', SPACE, node.statement);
	  }

	  ExpressionStatement(node) {
	    this.write(node.expression, ';');
	  }

	  Directive(node) {
	    this.write(node.expression, ';');
	  }

	  EmptyStatement() {
	    this.write(';');
	  }

	  VariableDeclaration(node) {
	    this.write(node.kind, ' ');
	    this.writeList(node.declarations);
	  }

	  VariableDeclarator(node) {
	    this.write(node.pattern);
	    if (node.initializer) this.write(SPACE, '=', SPACE, node.initializer);
	  }

	  ReturnStatement(node) {
	    if (node.argument) {
	      this.write('return ', node.argument, ';');
	    } else {
	      this.write('return;');
	    }
	  }

	  BreakStatement(node) {
	    this.write('break');
	    if (node.label) this.write(' ', node.label);
	    this.write(';');
	  }

	  ContinueStatement(node) {
	    this.write('continue');
	    if (node.label) this.write(' ', node.label);
	    this.write(';');
	  }

	  ThrowStatement(node) {
	    this.write('throw ', node.expression, ';');
	  }

	  DebuggerStatement() {
	    this.write('debugger;');
	  }

	  IfStatement(node) {
	    this.write('if', SPACE, '(', node.test, ')', SPACE, node.consequent);
	    if (node.alternate) {
	      this.write(node.consequent.type === 'Block' ? SPACE : NEWLINE, 'else ', node.alternate);
	    }
	  }

	  DoWhileStatement(node) {
	    this.write('do ', node.body, ' while (', node.test, ')');
	  }

	  WhileStatement(node) {
	    this.write('while', SPACE, '(', node.test, ')', SPACE, node.body);
	  }

	  ForStatement(node) {
	    this.write('for', SPACE, '(', node.initializer, ';', SPACE, node.test, ';', SPACE, node.update, ')', SPACE, node.body);
	  }

	  ForInStatement(node) {
	    this.write('for', SPACE, '(', node.left, ' in ', node.right, ')', SPACE, node.body);
	  }

	  ForOfStatement(node) {
	    this.write('for');
	    if (node.async) this.write(' await');
	    this.write(SPACE, '(', node.left, ' of ', node.right, ')', SPACE, node.body);
	  }

	  WithStatement(node) {
	    this.write('with', SPACE, '(', node.object, ')', SPACE, node.body);
	  }

	  SwitchStatement(node) {
	    this.write('switch', SPACE, '(', node.descriminant, ')', SPACE, '{', INDENT);
	    this.writeList(node.cases, NEWLINE);
	    this.write(OUTDENT, '}');
	  }

	  SwitchCase(node) {
	    if (node.test) this.write('case ', node.test, ':');
	    else this.write('default:');
	    if (node.consequent.length > 0) {
	      this.write(INDENT);
	      this.writeStatements(node.consequent);
	      this.depth--;
	    }
	  }

	  TryStatement(node) {
	    this.write('try', SPACE, node.block);
	    if (node.handler) this.write(SPACE, node.handler);
	    if (node.finalizer) this.write(SPACE, 'finally', SPACE, node.finalizer);
	  }

	  CatchClause(node) {
	    this.write('catch', SPACE, '(', node.param, ')', SPACE, node.body);
	  }

	  FunctionDeclaration(node) {
	    this.FunctionExpression(node);
	  }

	  FunctionExpression(node) {
	    if (node.kind === 'async' || node.kind === 'async-generator') this.write('async ');
	    this.write('function');
	    if (node.kind === 'generator' || node.kind === 'async-generator') this.write('*');
	    if (node.identifier) this.write(' ', node.identifier);
	    this.write('(');
	    this.writeList(node.params);
	    this.write(')', SPACE, node.body);
	  }

	  FormalParameter(node) {
	    this.write(node.pattern);
	    if (node.initializer) this.write(SPACE, '=', SPACE, node.initializer);
	  }

	  RestParameter(node) {
	    this.write('...', node.identifier);
	  }

	  FunctionBody(node) {
	    if (node.statements.length === 0) {
	      this.write('{}');
	    } else {
	      this.write('{', INDENT);
	      this.writeStatements(node.statements);
	      this.write(OUTDENT, '}');
	    }
	  }

	  ArrowFunction(node) {
	    if (node.kind === 'async') this.write('async ');
	    this.write('(');
	    this.writeList(node.params);
	    this.write(')', SPACE, '=>', SPACE, node.body);
	  }

	  ClassDeclaration(node) {
	    this.ClassExpression(node);
	  }

	  ClassExpression(node) {
	    this.write('class');
	    if (node.identifier) this.write(' ', node.identifier);
	    if (node.base) this.write(' extends ', node.base);
	    this.write(SPACE, node.body);
	  }

	  ClassBody(node) {
	    if (node.elements.length === 0) {
	      this.write('{}');
	    } else {
	      this.write('{', INDENT);
	      this.writeList(node.elements, (node, prev) => {
	        if (!(node.type === 'ClassField' && prev.type === 'ClassField')) this.newline(2);
	        else this.newline();
	      });
	      this.write(OUTDENT, '}');
	    }
	  }

	  EmptyClassElement() {
	    this.write(';');
	  }

	  ClassField(node) {
	    if (node.static) this.write('static ');
	    this.write(node.name);
	    if (node.initializer) this.write(SPACE, '=', SPACE, node.initializer);
	    this.write(';');
	  }

	  ImportCall(node) {
	    this.write('import', SPACE, '(', node.argument, ')');
	  }

	  ImportDeclaration(node) {
	    this.write('import ');
	    if (node.imports) this.write(node.imports, ' from ');
	    this.write(node.from, ';');
	  }

	  NamespaceImport(node) {
	    this.write('* as ', node.identifier);
	  }

	  NamedImports(node) {
	    this.write('{', SPACE);
	    this.writeList(node.specifiers);
	    this.write(SPACE, '}');
	  }

	  DefaultImport(node) {
	    this.write(node.identifier);
	    if (node.imports) this.write(',', SPACE, node.imports);
	  }

	  ImportSpecifier(node) {
	    this.write(node.imported);
	    if (node.local) this.write(' as ', node.local);
	  }

	  ExportDeclaration(node) {
	    this.write('export ', node.declaration);
	  }

	  ExportDefault(node) {
	    this.write('export default ', node.binding);
	    if (node.binding.type !== 'FunctionDeclaration' && node.binding.type !== 'ClassDeclaration') {
	      this.write(';');
	    }
	  }

	  ExportNameList(node) {
	    this.write('export', SPACE, '{', SPACE);
	    this.writeList(node.specifiers);
	    this.write(SPACE, '}');
	    if (node.from) this.write(SPACE, 'from', SPACE, node.from);
	    this.write(';');
	  }

	  ExportNamespace(node) {
	    this.write('export *');
	    if (node.identifier) this.write(' as ', node.identifier);
	    this.write(' from ', node.from, ';');
	  }

	  ExportDefaultFrom(node) {
	    this.write('export ', node.identifier, ' from ', node.from, ';');
	  }

	  ExportSpecifier(node) {
	    this.write(node.local);
	    if (node.exported) this.write(' as ', node.exported);
	  }
	}

	const VarNames = Symbol();

	class Scope {
	  constructor(type, strict, node = null) {
	    this.type = type;
	    this.node = node;
	    this.strict = strict;
	    this.names = new Map();
	    this.free = [];
	    this.parent = null;
	    this.children = [];
	    this[VarNames] = [];
	  }

	  resolveName(name) {
	    let record = this.names.get(name);
	    if (record) return record;
	    if (this.parent) return this.parent.resolveName(name);
	    return null;
	  }
	}

	class ScopeResolver {
	  constructor() {
	    this.stack = [];
	    this.top = null;
	    this.lineMap = null;
	  }

	  resolve(ast, options = {}) {
	    this.lineMap = options.lineMap;
	    this.top = new Scope('var', false, ast);
	    this.visit(ast);
	    this.flushFree();
	    this.top[VarNames] = null;
	    return this.top;
	  }

	  fail(msg, node) {
	    let err = new SyntaxError(msg);
	    if (this.lineMap) {
	      let loc = this.lineMap.locate(node.start);
	      err.line = loc.line;
	      err.column = loc.column;
	      err.lineOffset = loc.lineOffset;
	      err.startOffset = node.start;
	      err.endOffset = node.end;
	    }
	    throw err;
	  }

	  pushScope(type, node) {
	    let strict = this.top.strict;
	    this.stack.push(this.top);
	    return this.top = new Scope(type, strict, node);
	  }

	  flushFree() {
	    let map = this.top.names;
	    let free = this.top.free;
	    let next = null;
	    let freeList = [];
	    if (this.stack.length > 0) next = this.stack[this.stack.length - 1];
	    this.top.free = freeList;
	    free.forEach((r) => {
	      let name = r.value;
	      let record = map.get(name);
	      if (record) {
	        record.references.push(r);
	      } else if (next) {
	        next.free.push(r);
	      } else {
	        freeList.push(r);
	      }
	    });
	  }

	  linkScope(child) {
	    let p = this.top;
	    child.parent = p;
	    p.children.push(child);
	  }

	  popScope() {
	    let scope = this.top;
	    let varNames = scope[VarNames];
	    scope[VarNames] = null;
	    this.flushFree();
	    this.top = this.stack.pop();
	    this.linkScope(scope);
	    varNames.forEach((n) => {
	      if (scope.names.has(n.value)) this.fail('Cannot shadow lexical declaration with var', n);
	      else if (this.top.type === 'var') this.addName(n, 'var');
	      else this.top[VarNames].push(n);
	    });
	  }

	  visit(node, kind) {
	    if (!node) return;
	    let f = this[node.type];
	    if (typeof f === 'function') f.call(this, node, kind);
	    else forEachChild(node, (n) => this.visit(n, kind));
	  }

	  hasStrictDirective(statements) {
	    for (let i = 0; i < statements.length; ++i) {
	      let n = statements[i];
	      if (n.type !== 'Directive') break;
	      if (n.value === 'use strict') return true;
	    }
	    return false;
	  }

	  visitFunction(params, body, strictParams) {
	    let paramScope = this.pushScope('param');
	    if (!this.top.strict && body.statements && this.hasStrictDirective(body.statements)) {
	      this.top.strict = true;
	    }
	    strictParams = strictParams || this.top.strict;
	    params.forEach((n) => {
	      if (!strictParams && (n.type !== 'FormalParameter' || n.initializer || n.pattern.type !== 'Identifier')) {
	        strictParams = true;
	      }
	      this.visit(n, 'param');
	      this.flushFree();
	      this.top.free.length = 0;
	    });
	    this.pushScope('var', body);
	    let blockScope = this.pushScope('block', body);
	    this.visit(body, 'var');
	    this.popScope();
	    this.popScope();
	    this.popScope();
	    paramScope.names.forEach((record, name) => {
	      if (blockScope.names.has(name)) this.fail('Duplicate block declaration', blockScope.names.get(name).declarations[0]);
	      if (strictParams && record.declarations.length > 1) this.fail('Duplicate parameter names', record.declarations[1]);
	    });
	  }

	  addReference(node) {
	    let name = node.value;
	    let record = this.top.names.get(name);
	    if (record) record.references.push(node);
	    else this.top.free.push(node);
	  }

	  addName(node, kind) {
	    let name = node.value;
	    let record = this.top.names.get(name);
	    if (record) {
	      if (kind !== 'var' && kind !== 'param') this.fail('Duplicate variable declaration', node);
	    } else {
	      if (name === 'let' && (kind === 'let' || kind === 'const')) this.fail('Invalid binding identifier', node);
	      this.top.names.set(name, record = {
	        declarations: [],
	        references: [],
	        const: kind === 'const'
	      });
	    }
	    record.declarations.push(node);
	  }

	  Script(node) {
	    if (this.hasStrictDirective(node.statements)) this.top.strict = true;
	    this.pushScope('block', node);
	    forEachChild(node, (n) => this.visit(n, 'var'));
	    this.popScope();
	  }

	  Module(node) {
	    this.top.strict = true;
	    this.pushScope('block', node);
	    forEachChild(node, (n) => this.visit(n, 'var'));
	    this.popScope();
	  }

	  Block(node) {
	    this.pushScope('block', node);
	    forEachChild(node, (n) => this.visit(n));
	    this.popScope();
	  }

	  SwitchStatement(node) {
	    this.Block(node);
	  }

	  ForOfStatement(node) {
	    this.ForStatement(node);
	  }

	  ForInStatement(node) {
	    this.ForStatement(node);
	  }

	  ForStatement(node) {
	    this.pushScope('for', node);
	    forEachChild(node, (n) => this.visit(n));
	    this.popScope();
	  }

	  CatchClause(node) {
	    this.pushScope('catch', node);
	    forEachChild(node, (n) => this.visit(n));
	    this.popScope();
	  }

	  WithStatement(node) {
	    this.visit(node.object);
	    this.pushScope('with', node);
	    this.visit(node.body);
	    this.popScope();
	  }

	  VariableDeclaration(node) {
	    forEachChild(node, (n) => this.visit(n, node.kind));
	  }

	  ImportDeclaration(node) {
	    forEachChild(node, (n) => this.visit(n, 'const'));
	  }

	  FunctionDeclaration(node, kind) {
	    this.visit(node.identifier, kind);
	    this.pushScope('function', node);
	    this.visitFunction(node.params, node.body, false);
	    this.popScope();
	  }

	  FunctionExpression(node) {
	    this.pushScope('function', node);
	    this.visit(node.identifier);
	    this.visitFunction(node.params, node.body, false);
	    this.popScope();
	  }

	  MethodDefinition(node) {
	    this.pushScope('function', node);
	    this.visitFunction(node.params, node.body, true);
	    this.popScope();
	  }

	  ArrowFunction(node) {
	    this.pushScope('function', node);
	    this.visitFunction(node.params, node.body, true);
	    this.popScope();
	  }

	  ClassDeclaration(node) {
	    this.visit(node.identifier, 'let');
	    this.pushScope('class', node);
	    this.top.strict = true;
	    this.visit(node.base);
	    this.visit(node.body);
	    this.popScope();
	  }

	  ClassExpression(node) {
	    this.pushScope('class', node);
	    this.top.strict = true;
	    this.visit(node.identifier);
	    this.visit(node.base);
	    this.visit(node.body);
	    this.popScope();
	  }

	  Identifier(node, kind) {
	    switch (node.context) {
	      case 'variable':
	        this.top.free.push(node);
	        break;
	      case 'declaration':
	        if (kind === 'var' && this.top.type !== 'var') this.top[VarNames].push(node);
	        else this.addName(node, kind);
	        break;
	    }
	  }
	}

	function print(ast, options) {
	  return new Printer().print(ast, options);
	}

	function parse(input, options = {}) {
	  let parser = new Parser(input, options);
	  let result = options.module ? parser.parseModule() : parser.parseScript();
	  return result;
	}

	function resolveScopes(ast, options) {
	  return new ScopeResolver().resolve(ast, options);
	}

	exports.AST = AST;
	exports.parse = parse;
	exports.print = print;
	exports.resolveScopes = resolveScopes;


	});

	unwrapExports(Parser_1);
	var Parser_2 = Parser_1.AST;
	var Parser_3 = Parser_1.parse;
	var Parser_4 = Parser_1.print;
	var Parser_5 = Parser_1.resolveScopes;

	var compiler = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	const $node = Symbol('@node');
	const $location = Symbol('@location');
	const $parent = Symbol('@parent');
	const $scopeInfo = Symbol('@scopeInfo');
	const $changeList = Symbol('@changeList');
	const $getLocation = Symbol('@getLocation');

	class Path {
	  constructor(node, parent = null, location = null) {
	    this[$node] = node;
	    this[$location] = location;
	    this[$parent] = parent;
	    this[$scopeInfo] = parent ? parent[$scopeInfo] : null;
	    this[$changeList] = [];
	  }

	  get node() {
	    return this[$node];
	  }

	  get parent() {
	    return this[$parent];
	  }

	  get parentNode() {
	    return this[$parent] ? this[$parent][$node] : null;
	  }

	  forEachChild(fn) {
	    if (!this[$node]) {
	      return;
	    }
	    let paths = [];
	    Parser_1.AST.forEachChild(this[$node], (child, key, index) => {
	      let path = new Path(child, this, { key, index });
	      paths.push(path);
	      fn(path);
	    });
	    for (let path of paths) {
	      path.applyChanges();
	    }
	  }

	  applyChanges() {
	    let list = this[$changeList];
	    this[$changeList] = [];
	    for (let record of list) {
	      if (!this[$node]) {
	        break;
	      }
	      record.apply();
	    }
	  }

	  removeNode() {
	    this[$changeList].push(new ChangeRecord(this, 'replaceNode', [null]));
	  }

	  replaceNode(newNode) {
	    this[$changeList].push(new ChangeRecord(this, 'replaceNode', [newNode]));
	  }

	  insertNodesBefore(...nodes) {
	    this[$changeList].push(new ChangeRecord(this, 'insertNodesBefore', nodes));
	  }

	  insertNodesAfter(...nodes) {
	    this[$changeList].push(new ChangeRecord(this, 'insertNodesAfter', nodes));
	  }

	  visitChildren(visitor) {
	    this.forEachChild((childPath) => childPath.visit(visitor));
	  }

	  visit(visitor) {
	    if (!this[$node]) {
	      return;
	    }
	    let method = visitor[this[$node].type];
	    if (typeof method === 'function') {
	      method.call(visitor, this);
	    }
	    if (!this[$node]) {
	      return;
	    }
	    let { after } = visitor;
	    if (typeof after === 'function') {
	      after.call(visitor, this);
	    }
	    if (!method) {
	      this.visitChildren(visitor);
	    }
	  }

	  uniqueIdentifier(baseName, options = {}) {
	    let scopeInfo = this[$scopeInfo];
	    let ident = null;
	    for (let i = 0; true; ++i) {
	      let value = baseName;
	      if (i > 0) value += '_' + i;
	      if (!scopeInfo.names.has(value)) {
	        ident = value;
	        break;
	      }
	    }
	    scopeInfo.names.add(ident);
	    if (options.kind) {
	      this[$changeList].unshift(new ChangeRecord(this, 'insertDeclaration', [ident, options]));
	    }
	    return ident;
	  }

	  static fromParseResult(result) {
	    let path = new Path(result.ast);
	    path[$scopeInfo] = getScopeInfo(result);
	    return path;
	  }

	  [$getLocation](fn) {
	    if (!this[$parent]) {
	      throw new Error('Node does not have a parent');
	    }
	    let { key, index } = this[$location];
	    let node = this[$node];
	    let parent = this[$parent][$node];
	    let valid = typeof index === 'number' ? parent[key][index] === node : parent[key] === node;
	    if (!valid) {
	      Parser_1.AST.forEachChild(parent, (child, k, i, stop) => {
	        if (child === node) {
	          valid = true;
	          this[$location] = {
	            key: (key = k),
	            index: (index = i)
	          };
	          return stop;
	        }
	      });
	    }
	    if (!valid) {
	      throw new Error('Unable to determine node location');
	    }
	    fn(parent, key, index);
	  }
	}

	class ChangeRecord {
	  constructor(path, name, args) {
	    this.path = path;
	    this.name = name;
	    this.args = args;
	  }

	  apply() {
	    switch (this.name) {
	      case 'replaceNode':
	        return this.replaceNode(this.args[0]);
	      case 'insertNodesAfter':
	        return this.insertNodesAfter(this.args);
	      case 'insertNodesBefore':
	        return this.insertNodesBefore(this.args);
	      case 'insertDeclaration':
	        return this.insertDeclaration(...this.args);
	      default:
	        throw new Error('Invalid change record type');
	    }
	  }

	  replaceNode(newNode) {
	    if (this.path[$parent]) {
	      this.path[$getLocation]((parent, key, index) => {
	        if (typeof index !== 'number') {
	          parent[key] = newNode;
	        } else if (newNode) {
	          parent[key].splice(index, 1, newNode);
	        } else {
	          parent[key].splice(index, 1);
	        }
	      });
	    }
	    this.path[$node] = newNode;
	  }

	  insertNodesAfter(nodes) {
	    this.path[$getLocation]((parent, key, index) => {
	      if (typeof index !== 'number') {
	        throw new Error('Node is not contained within a node list');
	      }
	      parent[key].splice(index + 1, 0, ...nodes);
	    });
	  }

	  insertNodesBefore(nodes) {
	    this.path[$getLocation]((parent, key, index) => {
	      if (typeof index !== 'number') {
	        throw new Error('Node is not contained within a node list');
	      }
	      parent[key].splice(index, 0, ...nodes);
	    });
	  }

	  insertDeclaration(ident, options) {
	    let { statements } = getBlock(this.path).node;
	    statements.unshift({
	      type: 'VariableDeclaration',
	      kind: options.kind,
	      declarations: [{
	        type: 'VariableDeclarator',
	        pattern: {
	          type: 'Identifier',
	          value: ident
	        },
	        initializer: options.initializer || null
	      }]
	    });
	  }
	}

	function getScopeInfo(parseResult) {
	  let scopeTree = Parser_1.resolveScopes(parseResult.ast, {
	    lineMap: parseResult.lineMap
	  });
	  let names = new Set();

	  function visit(scope) {
	    scope.names.forEach((value, key) => names.add(key));
	    scope.free.forEach((ident) => names.add(ident.value));
	    scope.children.forEach(visit);
	  }

	  visit(scopeTree);
	  return { names };
	}

	function getBlock(path) {
	  while (path) {
	    switch (path.node.type) {
	      case 'Script':
	      case 'Module':
	      case 'Block':
	      case 'FunctionBody':
	        return path;
	    }
	    path = path.parent;
	  }
	  return null;
	}

	const LINK_PREFIX = '\n\n//# sourceMappingURL=';

	function generateSourceMap(mappings, options = {}) {
	  let sourceData = new Map();
	  let defaultSource = '__source__';
	  let hasContent = false;
	  for (let item of options.sources || []) {
	    if (item.default) {
	      defaultSource = item.file;
	    }
	    if (item.content) {
	      hasContent = true;
	    }
	    sourceData.set(item.file, item);
	  }
	  let names = new Map();
	  let sources = new Map();
	  let encodedMappings = serializeMappings(mappings, names, sources, defaultSource);
	  let map = {
	    version: 3,
	    sources: [...sources.keys()],
	    names: [...names.keys()],
	    mappings: encodedMappings
	  };
	  options.file && (map.file = options.file);
	  options.sourceRoot && (map.sourceRoot = options.sourceRoot);
	  if (hasContent) {
	    map.sourcesContent = [...sources.keys()].map((source) => {
	      let entry = sourceData.get(source);
	      return (entry && typeof entry.content === 'string') ? entry.content : null;
	    });
	  }
	  return map;
	}

	function encodeInlineSourceMap(sourceMap) {
	  return LINK_PREFIX + 'data:application/json;charset=utf-8;base64,' + Buffer.from(JSON.stringify(sourceMap)).toString('base64');
	}

	function encodeSourceMapLink(target) {
	  return LINK_PREFIX + target;
	}

	const BASE64 = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789+/').split('');

	function toVLQSigned(v) {
	  return v < 0 ? ((-v) << 1) + 1 : (v << 1) + 0;
	}

	function encodeVLQ(v) {
	  let more = toVLQSigned(v);
	  let encoded = '';
	  do {
	    let digit = more & 31;
	    more >>>= 5;
	    encoded += BASE64[more ? digit | 32 : digit];
	  } while (more)
	  ;
	  return encoded;
	}

	function optionalStringEqual(a, b) {
	  return a === b || (a == null && b == null);
	}

	function mappingsEqual(a, b) {
	  return (a.generated.line === b.generated.line && a.generated.column === b.generated.column && a.original.line === b.original.line && a.original.column === b.original.column && optionalStringEqual(a.source, b.source) && optionalStringEqual(a.name, b.name));
	}

	function serializeMappings(mappings, names, sources, defaultSource) {
	  let prevGeneratedLine = 0;
	  let prevGeneratedColumn = 0;
	  let prevOriginalLine = 0;
	  let prevOriginalColumn = 0;
	  let prevName = 0;
	  let prevSource = 0;
	  let result = '';
	  for (let i = 0; i < mappings.length; ++i) {
	    let mapping = mappings[i];
	    if (mapping.generated.line !== prevGeneratedLine) {
	      prevGeneratedColumn = 0;
	      do {
	        result += ';';
	        prevGeneratedLine++;
	      } while (mapping.generated.line !== prevGeneratedLine)
	      ;
	    } else if (i > 0) {
	      if (mappingsEqual(mapping, mappings[i - 1])) {
	        continue;
	      }
	      result += ',';
	    }
	    result += encodeVLQ(mapping.generated.column - prevGeneratedColumn);
	    prevGeneratedColumn = mapping.generated.column;
	    let source = mapping.source || defaultSource;
	    if (!sources.has(source)) {
	      sources.set(source, sources.size);
	    }
	    let sourceIndex = sources.get(source);
	    result += encodeVLQ(sourceIndex - prevSource);
	    prevSource = sourceIndex;
	    result += encodeVLQ(mapping.original.line - prevOriginalLine);
	    prevOriginalLine = mapping.original.line;
	    result += encodeVLQ(mapping.original.column - prevOriginalColumn);
	    prevOriginalColumn = mapping.original.column;
	    if (mapping.name) {
	      if (!names.has(mapping.name)) {
	        names.set(mapping.name, names.size);
	      }
	      let nameIndex = names.get(mapping.name);
	      result += encodeVLQ(nameIndex - prevName);
	      prevName = nameIndex;
	    }
	  }
	  return result;
	}

	function registerTransform({ define, context, templates, AST }) {
	  define((rootPath) => rootPath.visit(new class SymbolNameVisitor {
	    constructor() {
	      let names = context.get('symbolNames');
	      if (!names) {
	        names = new Map();
	        context.set('symbolNames', names);
	      }
	      this.names = names;
	    }

	    getIdentifierName(value) {
	      if (this.names.has(value)) {
	        return this.names.get(value);
	      }
	      let name = rootPath.uniqueIdentifier('$' + value.slice(1), {
	        kind: 'const',
	        initializer: new AST.CallExpression(new AST.Identifier('Symbol'), [new AST.StringLiteral(value)])
	      });
	      this.names.set(value, name);
	      return name;
	    }

	    SymbolName(path) {
	      path.replaceNode(new AST.ComputedPropertyName(new AST.Identifier(this.getIdentifierName(path.node.value))));
	    }
	  }));
	}

	var SymbolNameTransform = Object.freeze({
	  registerTransform: registerTransform
	});

	function registerTransform$1({ define, templates, AST }) {
	  define((rootPath) => new ImportExportProcessor().execute(rootPath));

	  class ImportExportProcessor {
	    constructor() {
	      this.rootPath = null;
	      this.moduleNames = new Map();
	      this.reexports = [];
	      this.exports = [];
	      this.imports = [];
	      this.replacements = null;
	      this.index = 0;
	      this.topImport = null;
	      this.metaName = null;
	    }

	    execute(rootPath) {
	      this.rootPath = rootPath;
	      this.visit(rootPath.node);
	    }

	    visit(node) {
	      if (node && this[node.type]) {
	        this[node.type](node);
	      }
	    }

	    replaceWith(newNode) {
	      this.replacements[this.index] = newNode;
	    }

	    getPatternDeclarations(node, list) {
	      switch (node.type) {
	        case 'VariableDeclaration':
	          node.declarations.forEach((c) => this.getPatternDeclarations(c, list));
	          break;
	        case 'VariableDeclarator':
	          this.getPatternDeclarations(node.pattern, list);
	          break;
	        case 'Identifier':
	          list.push(node);
	          break;
	        case 'ObjectPattern':
	          node.properties.forEach((p) => this.getPatternDeclarations(p.pattern || p.name, list));
	          break;
	        case 'ArrayPattern':
	          node.elements.forEach((p) => this.getPatternDeclarations(p.pattern, list));
	          break;
	      }
	    }

	    hasTopLevelAwait() {
	      let topLevelFound = {};
	      try {
	        this.rootPath.visit({
	          FunctionBody() {},
	          ArrowFunction() {},
	          UnaryExpression(path) {
	            if (path.node.operator === 'await') {
	              throw topLevelFound;
	            }
	            path.visitChildren(this);
	          }
	        });
	      } catch (err) {
	        if (err === topLevelFound) {
	          return true;
	        }
	        throw err;
	      }
	      return false;
	    }

	    Module(node) {
	      let moduleScope = Parser_1.resolveScopes(node).children[0];
	      let replaceMap = new Map();
	      let { rootPath } = this;
	      this.replacements = Array.from(node.statements);
	      for (let i = 0; i < node.statements.length; ++i) {
	        this.index = i;
	        this.visit(node.statements[i]);
	      }
	      let statements = [];
	      for (let { local, exported, hoist } of this.exports) {
	        if (hoist) {
	          statements.push(templates.statement`
            exports.${exported} = ${local}
          `);
	        }
	      }
	      for (let { names, from, exporting } of this.imports) {
	        if (exporting && names.length === 1) {
	          let { imported, local } = names[0];
	          if (imported) {
	            statements.push(templates.statement`
              exports.${local} = require(${from}).${imported}
            `);
	          } else if (local) {
	            statements.push(templates.statement`
              exports.${local} = require(${from})
            `);
	          } else {
	            statements.push(templates.statement`
              Object.assign(exports, require(${from}))
            `);
	          }
	          continue;
	        }
	        let moduleName = this.moduleNames.get(from.value);
	        if (!moduleName) {
	          moduleName = rootPath.uniqueIdentifier('_' + from.value.replace(/.*[\/\\](?=[^\/\\]+$)/, '').replace(/\..*$/, '').replace(/[^a-zA-Z0-1_$]/g, '_'));
	          this.moduleNames.set(from.value, moduleName);
	          statements.push(templates.statement`
            let ${moduleName} = require(${from})
          `);
	        }
	        for (let { imported, local } of names) {
	          let statement = null;
	          if (exporting) {
	            if (imported) {
	              statement = templates.statement`
                exports.${local} = ${moduleName}.${imported}
              `;
	            } else if (local) {
	              statement = templates.statement`
                exports.${local} = ${moduleName}
              `;
	            } else {
	              statement = templates.statement`
                Object.assign(exports, ${moduleName})
              `;
	            }
	          } else {
	            if (imported) {
	              if (imported === 'default') {
	                statement = templates.statement`
                  if (typeof ${moduleName} === 'function') {
                    ${moduleName} = { default: ${moduleName} };
                  }
                `;
	              }
	              for (let ref of moduleScope.names.get(local).references) {
	                replaceMap.set(ref, new AST.MemberExpression(new AST.Identifier(moduleName), new AST.Identifier(imported)));
	              }
	            } else {
	              statement = templates.statement`
                const ${local} = ${moduleName}
              `;
	            }
	          }
	          if (statement) {
	            statements.push(statement);
	          }
	        }
	      }
	      for (let node of this.replacements) {
	        if (Array.isArray(node)) {
	          node.forEach((n) => statements.push(n));
	        } else if (node) {
	          statements.push(node);
	        }
	      }
	      node.statements = statements;
	      rootPath.visit({
	        Identifier(path) {
	          let expr = replaceMap.get(path.node);
	          if (!expr) {
	            return;
	          }
	          let { parentNode } = path;
	          switch (parentNode.type) {
	            case 'PatternProperty':
	              if (parentNode.name === path.node && !parentNode.pattern) {
	                parentNode.pattern = expr;
	              }
	              break;
	            case 'PropertyDefinition':
	              if (!parentNode.expression) {
	                parentNode.expression = expr;
	              }
	              break;
	            case 'CallExpression':
	              path.replaceNode(templates.expression`
                (0, ${expr})
              `);
	              break;
	            default:
	              path.replaceNode(expr);
	              break;
	          }
	        },
	        ImportCall(path) {
	          path.visitChildren(this);
	          path.replaceNode(templates.expression`
            Promise.resolve(require(${path.node.argument}))
          `);
	        },
	        MetaProperty(path) {
	          path.visitChildren(this);
	          if (path.node.left !== 'import' || path.node.right !== 'meta') {
	            return;
	          }
	          if (!this.metaName) {
	            this.metaName = rootPath.uniqueIdentifier('importMeta', {
	              kind: 'const',
	              initializer: templates.expression`
                ({
                  require,
                  dirname: __dirname,
                  filename: __filename,
                })
              `.expression
	            });
	          }
	          path.replaceNode(new AST.Identifier(this.metaName));
	        }
	      });
	      rootPath.applyChanges();
	      if (this.hasTopLevelAwait()) {
	        if (this.exports.length > 0) {
	          throw new Error('Module with top-level await cannot have exports');
	        }
	        let fn = new AST.FunctionExpression('async', null, [], new AST.FunctionBody(node.statements));
	        node.statements = templates.statementList`
          (${fn})().catch(err => setTimeout(() => { throw err; }, 0));
        `;
	      }
	      node.statements.unshift(new AST.Directive('use strict', new AST.StringLiteral('use strict')));
	    }

	    ImportDeclaration(node) {
	      this.imports.push(this.topImport = {
	        names: [],
	        from: node.from,
	        exporting: false
	      });
	      this.visit(node.imports);
	      this.replaceWith(null);
	    }

	    NamedImports(node) {
	      for (let child of node.specifiers) {
	        this.visit(child);
	      }
	    }

	    ImportSpecifier(node) {
	      this.topImport.names.push({
	        imported: node.imported.value,
	        local: node.local ? node.local.value : node.imported.value
	      });
	    }

	    DefaultImport(node) {
	      this.topImport.names.push({
	        imported: 'default',
	        local: node.identifier.value
	      });
	      this.visit(node.imports);
	    }

	    NamespaceImport(node) {
	      this.topImport.names.push({
	        imported: null,
	        local: node.identifier.value
	      });
	    }

	    ExportDeclaration(node) {
	      let { declaration } = node;
	      if (declaration.type === 'VariableDeclaration') {
	        let statements = [declaration];
	        let bindings = [];
	        this.getPatternDeclarations(declaration, bindings);
	        for (let ident of bindings) {
	          this.exports.push({
	            local: ident.value,
	            exported: ident.value,
	            hoist: false
	          });
	          statements.push(templates.statement`
            exports.${ident.value} = ${ident.value}
          `);
	        }
	        this.replaceWith(statements);
	      } else {
	        let ident = declaration.identifier;
	        let exportName = {
	          local: ident.value,
	          exported: ident.value,
	          hoist: false
	        };
	        if (declaration.type === 'FunctionDeclaration') {
	          exportName.hoist = true;
	          this.replaceWith(declaration);
	        } else {
	          this.replaceWith([declaration, templates.statement`
              exports.${ident.value} = ${ident.value}
            `]);
	        }
	        this.exports.push(exportName);
	      }
	    }

	    ExportNameList(node) {
	      if (node.from) {
	        let reexport = {
	          names: [],
	          from: node.from,
	          exporting: true
	        };
	        for (let child of node.specifiers) {
	          reexport.names.push({
	            imported: child.local.value,
	            local: child.exported ? child.exported.value : child.local.value
	          });
	        }
	        this.imports.push(reexport);
	        this.replaceWith(null);
	      } else {
	        let statements = [];
	        for (let child of node.specifiers) {
	          let name = {
	            local: child.local.value,
	            exported: child.exported ? child.exported.value : child.local.value,
	            hoist: false
	          };
	          this.exports.push(name);
	          statements.push(templates.statement`
            exports.${name.exported} = ${child.local}
          `);
	        }
	        this.replaceWith(statements);
	      }
	    }

	    ExportDefault(node) {
	      let { binding } = node;
	      if (binding.type === 'FunctionDeclaration' || binding.type === 'ClassDeclaration') {
	        if (!binding.identifier) {
	          binding.identifier = new AST.Identifier(this.rootPath.uniqueIdentifier('_default'));
	        }
	        let exportName = {
	          local: binding.identifier.value,
	          exported: 'default',
	          hoist: false
	        };
	        if (binding.type === 'FunctionDeclaration') {
	          exportName.hoist = true;
	          this.replaceWith(binding);
	        } else {
	          this.replaceWith([binding, templates.statement`
              exports.default = ${binding.identifier.value}
            `]);
	        }
	        this.exports.push(exportName);
	      } else {
	        this.exports.push({
	          local: null,
	          exported: 'default',
	          hoist: false
	        });
	        this.replaceWith(templates.statement`
          exports.default = ${node.binding};
        `);
	      }
	    }

	    ExportNamespace(node) {
	      this.imports.push({
	        names: [{
	          imported: null,
	          local: node.identifier ? node.identifier.value : null
	        }],
	        from: node.from,
	        exporting: true
	      });
	      this.replaceWith(null);
	    }

	    ExportDefaultFrom(node) {
	      this.imports.push({
	        names: [{
	          imported: 'default',
	          local: node.identifier.value
	        }],
	        from: node.from,
	        exporting: true
	      });
	      this.replaceWith(null);
	    }
	  }
	}

	var ModuleTransform = Object.freeze({
	  registerTransform: registerTransform$1
	});

	function registerTransform$2({ define, context, templates, AST }) {
	  define((rootPath) => rootPath.visit(new class MethodExtractionVisitor {
	    constructor() {
	      this.helperName = context.get('methodExtractionHelper') || '';
	    }

	    insertHelper() {
	      if (this.helperName) {
	        return this.helperName;
	      }
	      let mapName = rootPath.uniqueIdentifier('_methodMap', {
	        kind: 'const',
	        initializer: new AST.NewExpression(new AST.Identifier('WeakMap'), [])
	      });
	      this.helperName = rootPath.uniqueIdentifier('_extractMethod', {
	        kind: 'const',
	        initializer: templates.expression`
          (obj, f) => {
            if (typeof f !== 'function') {
              throw new TypeError('Property is not a function');
            }
            let map = ${mapName}.get(obj);
            if (map) {
              let fn = map.get(f);
              if (fn) {
                return fn;
              }
            } else {
              map = new WeakMap();
              ${mapName}.set(obj, map);
            }
            let bound = Object.freeze(f.bind(obj));
            map.set(f, bound);
            return bound;
          }
        `
	      });
	      context.set('methodExtractionHelper', this.helperName);
	      return this.helperName;
	    }

	    UnaryExpression(path) {
	      path.visitChildren(this);
	      if (path.node.operator !== '&') {
	        return;
	      }
	      let member = path.node.expression;
	      while (member.type === 'ParenExpression') {
	        member = member.expression;
	      }
	      let helper = this.insertHelper();
	      if (member.object.type === 'Identifier' || member.object.type === 'ThisExpression') {
	        path.replaceNode(templates.expression`
          ${helper}(${member.object}, ${member})
        `);
	      } else {
	        let temp = path.uniqueIdentifier('_tmp', {
	          kind: 'let'
	        });
	        path.replaceNode(templates.expression`
          (
            ${temp} = ${member.object},
            ${helper}(${temp}, ${new AST.MemberExpression(temp, member.property)})
          )
        `);
	      }
	    }
	  }));
	}

	var MethodExtractionTransform = Object.freeze({
	  registerTransform: registerTransform$2
	});

	function registerTransform$3({ define, templates, AST }) {
	  define((rootPath) => rootPath.visit(new class CallWithVisitor {
	    CallWithExpression(path) {
	      path.visitChildren(this);
	      let { node } = path;
	      let call = new AST.CallExpression(node.callee, node.arguments);
	      if (node.subject.type === 'Identifier' || node.subject.type === 'ThisExpression') {
	        node.arguments.unshift(node.subject);
	        path.replaceNode(call);
	      } else {
	        let temp = path.uniqueIdentifier('_tmp', {
	          kind: 'let'
	        });
	        node.arguments.unshift(new AST.Identifier(temp));
	        path.replaceNode(templates.expression`
          (${temp} = ${node.subject}, ${call})
        `);
	      }
	    }
	  }));
	}

	var CallWithTransform = Object.freeze({
	  registerTransform: registerTransform$3
	});

	function registerTransform$4({ define, templates, AST }) {
	  define((rootPath) => rootPath.visit(new class NullCoalescingVisitor {
	    BinaryExpression(path) {
	      path.visitChildren(true);
	      let { node } = path;
	      if (node.operator !== '??') {
	        return;
	      }
	      if (node.left.type === 'Identifier') {
	        path.replaceNode(templates.expression`
          (${node.left} != null ? ${node.left} : ${node.right})
        `);
	      } else {
	        let temp = path.uniqueIdentifier('_temp', {
	          kind: 'let'
	        });
	        path.replaceNode(templates.expression`
          (
            ${temp} = ${node.left},
            ${temp} != null ? ${temp} : ${node.right}
          )
        `);
	      }
	    }
	  }));
	}

	var NullCoalescingTransform = Object.freeze({
	  registerTransform: registerTransform$4
	});

	function registerTransform$5() {}

	var AnnotationTransform = Object.freeze({
	  registerTransform: registerTransform$5
	});

	function getTransforms(options = {}) {
	  let list = [SymbolNameTransform, MethodExtractionTransform, CallWithTransform, NullCoalescingTransform, AnnotationTransform];
	  if (options.transformModules) {
	    list.push(ModuleTransform);
	  }
	  return list;
	}

	const PLACEHOLDER = '$$HOLE$$';

	function statement(literals, ...values) {
	  return moduleTemplate(literals, ...values).statements[0];
	}

	function statementList(literals, ...values) {
	  return moduleTemplate(literals, ...values).statements;
	}

	function expression(literals, ...values) {
	  return moduleTemplate(literals, ...values).statements[0].expression;
	}

	function moduleTemplate(literals, ...values) {
	  let source = '';
	  if (typeof literals === 'string') {
	    source = literals;
	  } else {
	    for (let i = 0; i < literals.length; ++i) {
	      source += literals[i];
	      if (i < values.length) source += PLACEHOLDER;
	    }
	  }
	  let result = Parser_1.parse(source, {
	    module: true
	  });
	  if (values.length === 0) {
	    return result.ast;
	  }
	  let path = new Path(result.ast);
	  let index = 0;
	  path.visit({
	    after(path) {
	      path.node.start = -1;
	      path.node.end = -1;
	    },
	    Identifier(path) {
	      if (path.node.value === PLACEHOLDER) {
	        let value = values[index++];
	        path.replaceNode(typeof value === 'string' ? new Parser_1.AST.Identifier(value) : value);
	      }
	    }
	  });
	  return result.ast;
	}

	var templates = Object.freeze({
	  statement: statement,
	  statementList: statementList,
	  expression: expression,
	  moduleTemplate: moduleTemplate
	});

	function basename(file) {
	  return file.replace(/^[^]*[\\/]([^\\/])|[\\/]+$/g, '$1');
	}

	class CompileResult {
	  constructor({ output, mappings }) {
	    this.output = output;
	    this.mappings = mappings;
	    this.sourceMap = null;
	    this.context = null;
	  }
	}

	function compile(source, options = {}) {
	  let parseResult = Parser_1.parse(source, {
	    module: options.module,
	    resolveScopes: true
	  });
	  let rootPath = Path.fromParseResult(parseResult);
	  let transforms = getTransforms({
	    transformModules: options.transformModules
	  });
	  let context = options.context || new Map();
	  let registry = registerTransforms(transforms, context);
	  runProcessors(rootPath, registry);
	  let result = new CompileResult(Parser_1.print(rootPath.node, {
	    lineMap: parseResult.lineMap
	  }));
	  result.context = context;
	  if (options.sourceMap) {
	    let filename = basename(options.location);
	    let map = generateSourceMap(result.mappings, {
	      sources: [{
	        file: filename,
	        content: source,
	        default: true
	      }]
	    });
	    if (options.sourceMap === 'inline') {
	      result.output += encodeInlineSourceMap(map);
	    } else {
	      result.output += encodeSourceMapLink(`${filename}.map`);
	      result.sourceMap = map;
	    }
	  }
	  return result;
	}

	function registerTransforms(transforms, context) {
	  let registry = new Set();
	  let api = {
	    define(processor) {
	      registry.add(processor);
	    },
	    templates,
	    context,
	    AST: Parser_1.AST
	  };
	  for (let module of transforms) {
	    module.registerTransform(api);
	  }
	  return registry;
	}

	function runProcessors(rootPath, registry) {
	  for (let processor of registry) {
	    processor(rootPath);
	    rootPath.applyChanges();
	  }
	}

	exports.compile = compile;


	});

	unwrapExports(compiler);
	var compiler_1 = compiler.compile;

	var compile = compiler.compile;

	function inspect(obj, opts) {
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor,
	    isOpaque: function() {
	      return false;
	    }
	  };
	  if (opts) Object.keys(opts).forEach(function(key) {
	    ctx[key] = opts[key];
	  });
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  return formatValue(ctx, obj, ctx.depth);
	}

	function stylizeNoColor(str, styleType) {
	  return str;
	}

	function arrayToHash(array) {
	  var hash = {};
	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });
	  return hash;
	}

	function formatValue(ctx, value, recurseTimes) {
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);
	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }
	  var formatted;
	  var raw = value;
	  try {
	    if (!isDate(value)) raw = value.valueOf();
	  } catch (e) {}
	  if (isString(raw)) {
	    keys = keys.filter(function(key) {
	      return !(key >= 0 && key < raw.length);
	    });
	  }
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	    if (isString(raw)) {
	      formatted = formatPrimitiveNoColor(ctx, raw);
	      return ctx.stylize('[String: ' + formatted + ']', 'string');
	    }
	    if (isNumber(raw)) {
	      formatted = formatPrimitiveNoColor(ctx, raw);
	      return ctx.stylize('[Number: ' + formatted + ']', 'number');
	    }
	    if (isBoolean(raw)) {
	      formatted = formatPrimitiveNoColor(ctx, raw);
	      return ctx.stylize('[Boolean: ' + formatted + ']', 'boolean');
	    }
	  }
	  if (ctx.isOpaque(raw)) {
	    return ctx.stylize(objectToString(raw), 'special');
	  }
	  var base = '', array = false, braces = ['{', '}'];
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }
	  if (isString(raw)) {
	    formatted = formatPrimitiveNoColor(ctx, raw);
	    base = ' ' + '[String: ' + formatted + ']';
	  }
	  if (isNumber(raw)) {
	    formatted = formatPrimitiveNoColor(ctx, raw);
	    base = ' ' + '[Number: ' + formatted + ']';
	  }
	  if (isBoolean(raw)) {
	    formatted = formatPrimitiveNoColor(ctx, raw);
	    base = ' ' + '[Boolean: ' + formatted + ']';
	  }
	  if (keys.length === 0 && (!array || value.length === 0)) {
	    return braces[0] + base + braces[1];
	  }
	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }
	  ctx.seen.push(value);
	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }
	  ctx.seen.pop();
	  return reduceToSingleString(output, base, braces);
	}

	function formatPrimitive(ctx, value) {
	  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
	  if (isSymbol(value)) return ctx.stylize('[Symbol]', 'special');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, '\\\'').replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value)) {
	    if (value === 0 && 1 / value < 0) return ctx.stylize('-0', 'number');
	    return ctx.stylize('' + value, 'number');
	  }
	  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');
	  if (isNull(value)) return ctx.stylize('null', 'null');
	}

	function formatPrimitiveNoColor(ctx, value) {
	  var stylize = ctx.stylize;
	  ctx.stylize = stylizeNoColor;
	  var str = formatPrimitive(ctx, value);
	  ctx.stylize = stylize;
	  return str;
	}

	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}

	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
	    }
	  });
	  return output;
	}

	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || {
	    value: value[key]
	  };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, '\\\'').replace(/\\"/g, '"').replace(/(^"|"$)/g, '\'').replace(/\\\\/g, '\\');
	      name = ctx.stylize(name, 'string');
	    }
	  }
	  return name + ': ' + str;
	}

	function reduceToSingleString(output, base, braces) {
	  var length = output.reduce(function(prev, cur) {
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);
	  if (length > 60) {
	    return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
	  }
	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}

	var isArray = Array.isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}

	function isNull(arg) {
	  return arg === null;
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isString(arg) {
	  return typeof arg === 'string';
	}

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}

	function isError(e) {
	  return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
	}

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	try {
	  new WeakMap().set({}, 1).get({});
	} catch (e) {
	}

	const escapeHTML = (function() {
	  let escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    '\'': '&#x27;',
	    '`': '&#x60;'
	  };

	  function createEscaper(map) {
	    function escaper(match) {
	      return map[match];
	    }

	    let source = '(?:' + Object.keys(map).join('|') + ')';
	    let testRegexp = RegExp(source);
	    let replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  }

	  return createEscaper(escapeMap);
	})();

	function replEval() {
	  return window.eval(arguments[0].replace(/(^|\n)\s*(const|let)\s/g, '\n var '));
	}

	const MAX_CONSOLE_LINES = 100;
	const NO_OUTPUT = {};
	const NEWLINE = /\r\n?|\n/g;

	function Literal(text) {
	  this.text = text;
	}

	function HtmlLiteral(html) {
	  this.html = html;
	}

	const compilerContext = new Map();
	let terminal;
	let input;
	let hidden;
	let prompt;
	let bufferedInput = '';
	let helpHTML = '';
	const replCommands = {
	  help() {
	    return new HtmlLiteral(helpHTML);
	  },
	  clear() {
	    return clearLines(1), NO_OUTPUT;
	  },
	  load(url) {
	    return loadScript(url), NO_OUTPUT;
	  },
	  translate(code) {
	    return new Literal(compile(code).output);
	  },
	  translateModule(code) {
	    return new Literal(compile(code, {
	      module: true
	    }).output);
	  },
	  link() {
	    return new Literal(generateLink());
	  }
	};
	const history = {
	  list: [''],
	  max: 50,
	  current: 0,
	  add(str) {
	    if (!str) {
	      return;
	    }
	    let len = this.list.length;
	    this.list[len - 1] = str;
	    this.list.push('');
	    this.current = len;
	  },
	  back(str) {
	    this._check(str);
	    if (this.current > 0) {
	      this.current -= 1;
	    }
	    return this.list[this.current];
	  },
	  forward(str) {
	    this._check(str);
	    if (this.current < this.list.length - 1) {
	      this.current += 1;
	    }
	    return this.list[this.current];
	  },
	  _check(str) {
	    if (str !== this.list[this.current]) {
	      this.current = this.list.length - 1;
	      this.list[this.current] = str;
	    }
	  }
	};

	function hasOwn(obj, key) {
	  return Object.prototype.hasOwnProperty.call(obj, key);
	}

	function loadScript(name) {
	  let url = hasOwn(SCRIPT_URLS, name) ? SCRIPT_URLS[name] : name;
	  let s = document.createElement('script');
	  s.async = true;
	  s.src = url;
	  elem('head').appendChild(s);
	  s.onload = function() {
	    addLine(stylize('Script loaded from ' + url, 'ok'));
	  };
	  s.onerror = function() {
	    addLine(stylize('Error: Unable to load script from ' + url, 'error'));
	  };
	  s = null;
	}

	function isOpaque(obj) {
	  return obj instanceof Node;
	}

	function elem(s) {
	  return document.querySelector(s);
	}

	function elems(s) {
	  return document.querySelectorAll(s);
	}

	function stylize(str, styleType) {
	  str = escapeHTML(str);
	  if (styleType) str = '<span class="js-' + styleType + '">' + str + '</span>';
	  return str;
	}

	function isRecoverableError(e, code) {
	  if (/(\n[ \t]*){2}$/.test(code)) {
	    return false;
	  }
	  let pattern = /^(Unexpected end of input|Unexpected token )/;
	  return e && e.name === 'SyntaxError' && pattern.test(e.message);
	}

	function formatError$1(error) {
	  return escapeHTML(error.message).replace(/^.+/, (m) => {
	    return '<span class="js-error">' + m + '</span>';
	  });
	}

	function replRun() {
	  let code = input.value;
	  if (bufferedInput) {
	    code = bufferedInput + '\n' + code;
	  }
	  advanceInput(async () => {
	    let executed = false;
	    let output = '';
	    let result;
	    let error;
	    if (code.trim() === '?') {
	      code = '.help';
	    }
	    if (code.charAt(0) === '.') {
	      executed = true;
	      let cmd = code.slice(1).replace(/\s[\s\S]*/g, '');
	      if (typeof replCommands[cmd] === 'function') {
	        try {
	          result = replCommands[cmd](code.slice(cmd.length + 1).trim());
	        } catch (x) {
	          error = x || {};
	        }
	      } else {
	        error = new Error('Invalid REPL command');
	      }
	    }
	    if (!executed) {
	      executed = true;
	      try {
	        code = compile(code, {
	          context: compilerContext
	        }).output;
	        result = await replEval(code);
	      } catch (x) {
	        error = x || {};
	      }
	    }
	    if (isRecoverableError(error, code)) {
	      bufferedInput = code;
	    } else if (result !== NO_OUTPUT) {
	      bufferedInput = '';
	      output = error ? formatError$1(error) : result instanceof Literal ? escapeHTML(result.text) : result instanceof HtmlLiteral ? result.html : inspect(result, {
	        stylize: stylize,
	        isOpaque: isOpaque
	      });
	    }
	    return output;
	  });
	}

	function autoIndent(last) {
	  let indent = last.split(NEWLINE).pop().replace(/\S[\s\S]*/, '');
	  if (/[\{\[]\s*$/.test(last)) {
	    indent += '  ';
	  }
	  return indent;
	}

	async function advanceInput(fn) {
	  let value = input.value;
	  history.add(value);
	  addLine(escapeHTML(value), prompt.className);
	  setInputValue('');
	  let output = fn && await fn() || '';
	  if (output) {
	    addLine(output);
	  }
	  prompt.className = bufferedInput ? 'prompt cont' : 'prompt';
	  clearLines(MAX_CONSOLE_LINES);
	  if (bufferedInput) {
	    setInputValue(autoIndent(value));
	  }
	  input.focus();
	  input.scrollIntoView();
	}

	function clearLines(max) {
	  let list = elems('#terminal > div');
	  let count = Math.max(0, list.length - max);
	  for (let i = 0; i < count; ++i) {
	    terminal.removeChild(list[i]);
	  }
	}

	function addLine(html, promptClass) {
	  let line = document.createElement('div');
	  line.className = 'output-line';
	  line.innerHTML = html || ' ';
	  if (promptClass) {
	    let span = document.createElement('span');
	    span.className = promptClass;
	    line.insertBefore(span, line.firstChild);
	    line.className += ' echo';
	  }
	  terminal.insertBefore(line, input.parentNode);
	  prompt.scrollIntoView();
	}

	function abort() {
	  bufferedInput = '';
	  advanceInput();
	}

	let resizeTimer = 0;

	function resizeInput() {
	  if (resizeTimer) {
	    return;
	  }
	  resizeTimer = setTimeout(() => {
	    resizeTimer = 0;
	    let value = input.value;
	    if (value === '') {
	      input.style.height = 'auto';
	    } else {
	      hidden.style.width = input.scrollWidth;
	      hidden.value = value;
	      input.style.height = (hidden.scrollHeight + hidden.clientHeight) + 'px';
	    }
	  }, 50);
	}

	function onKeyPress(evt) {
	  if (evt.keyCode === 13) {
	    if (!evt.shiftKey && !evt.ctrlKey) {
	      replRun();
	      evt.preventDefault();
	      return;
	    }
	    if (evt.shiftKey) {
	      setInputValue(input.value + '\n' + autoIndent(input.value));
	      evt.preventDefault();
	    }
	  }
	  resizeInput();
	}

	function setInputValue(value) {
	  input.value = value;
	  input.selectionStart = value.length;
	  input.selectionEnd = value.length;
	  prompt.scrollIntoView();
	  resizeInput();
	}

	function isCursorRow(row) {
	  let val = input.value;
	  if (!val) {
	    return true;
	  }
	  let start = input.selectionStart;
	  if (start !== input.selectionEnd) {
	    return false;
	  }
	  if (row === 'first') {
	    let index = val.search(NEWLINE);
	    return index < 0 || index >= start;
	  } else if (row === 'last') {
	    return start >= val.length - val.split(NEWLINE).pop().length;
	  } else {
	    return false;
	  }
	}

	function onKeyDown(evt) {
	  if (evt.ctrlKey && evt.keyCode === 67 || evt.keyCode === 27) {
	    abort();
	    evt.preventDefault();
	    return;
	  }
	  if (evt.keyCode === 38 && isCursorRow('first')) {
	    setInputValue(history.back(input.value));
	    evt.preventDefault();
	    return;
	  }
	  if (evt.keyCode === 40 && isCursorRow('last')) {
	    setInputValue(history.forward(input.value));
	    evt.preventDefault();
	    return;
	  }
	}

	function onClick() {
	  if (!window.getSelection || window.getSelection().isCollapsed) {
	    input.focus();
	  }
	}

	function onPaste() {
	  resizeInput();
	}

	function createHidden() {
	  let e = document.createElement(input.nodeName);
	  e.className = 'hidden';
	  e.rows = 1;
	  input.parentNode.appendChild(e);
	  return e;
	}

	function loadFromHash() {
	  let m = /____(.+)/.exec(window.location.hash);
	  if (m) {
	    input.value = decodeURIComponent(m[1]);
	    resizeInput();
	  }
	}

	function generateLink() {
	  let out = Array.from(elems('div.echo')).map((e) => {
	    return e.innerText.trim();
	  }).filter((text) => {
	    return text.charAt(0) !== '.';
	  }).join('\n');
	  out = '____' + encodeURIComponent(out);
	  window.location.hash = out;
	  return window.location.toString().replace(/#[\s\S]*/, '') + '#' + out;
	}

	function main() {
	  terminal = elem('#terminal');
	  input = elem('#terminal-input');
	  hidden = createHidden();
	  prompt = elem('#terminal div.input-line span');
	  helpHTML = '<div class="repl-help">' + elem('#repl-help-template').innerHTML + '</div>';
	  terminal.addEventListener('click', onClick, false);
	  input.addEventListener('keypress', onKeyPress, false);
	  input.addEventListener('keydown', onKeyDown, false);
	  input.addEventListener('paste', onPaste, false);
	  input.focus();
	  window.contentElement = elem('#content');
	  let consoleLog = window.console.log;
	  window.console.log = function(arg) {
	    addLine(inspect(arg, {
	      stylize: stylize,
	      isOpaque: isOpaque
	    }));
	    if (consoleLog) {
	      consoleLog.apply(this, arguments);
	    }
	  };
	  window.onerror = function(error) {
	    addLine(formatError$1(error));
	  };
	  addLine(helpHTML);
	  loadFromHash();
	}

	window.onload = main;

}());
//# sourceMappingURL=main.js.map
