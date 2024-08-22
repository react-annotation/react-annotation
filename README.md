# react-annotation

The [Flow's React Syntax](https://flow.org/en/docs/react) in TypeScript with an intuitive JSDoc-compliant annotation.

> [!WARNING]\
> This project is still in the very early stages of development and is not yet ready for use.

## Component Annotation

### Basic Usage

You can declare a component with Component Annotation by adding a comment block above the component declaration. The comment block should start with `@component` and can include a `@description` tag to describe the component.

```tsx
import * as React from "react";

/**
 * @component
 * @description A simple component that displays a name and age
 */
function Introduction({ name, age }: { name: string; age: number }) {
  return <h1>My name is {name} and I am {age} years old</h1>;
}
```

### Rules for Components

Component Annotation enforces a few restrictions in components to help ensure correctness:

The return values must be a subtype of React.Node, otherwise React may crash while rendering your component.

1. All branches of a component must end in an explicit return. Even though undefined is a valid return value, we've seen many instances where an explicit return would have
2. prevented bugs in production.
3. You cannot use this in a component.

So these components are invalid:

```tsx
import * as React from "react";

/**
 * @component
 * @description An invalid component that returns an object
 */
function InvalidReturnValue() {
  return new Object(); // ERROR: Value does not match `React.Node` type
}

/**
 * @component
 * @description An invalid component that does not return in all branches
 */
function ImplicitReturn(someCond: boolean) {
  if (someCond) {
    return <h1>Hello World!</h1>;
  }
  // ERROR: No return in this branch
}

/**
 * @component
 * @description An invalid component that uses `this`
 */
function UsesThis() {
  this.foo = 3; // ERROR: Accessing `this`
  return null;
}
```

## Hook Annotation

### Basic Usage

```tsx
import { useState, useEffect } from "react";

/**
 * @hook
 * @description A hook that returns the online status of the user
 */
export function useOnlineStatus(initial: boolean): boolean {
  const [isOnline, setIsOnline] = useState(initial);
  useEffect(() => {
    // ...
  }, []);
  return isOnline;
}
```

### Enforcing the Rules of React with Hook Syntax

With hook annotation, we can now unambiguously distinguish syntactically between hooks and non-hooks. `@react-annotation/typescript-plugin` will use this information to enforce a number of the [rules of hooks](https://react.dev/reference/rules) and Rules of React generally.

### Preventing Conflation of Hooks and Functions

The distinction between hooks and regular functions is reflected in the JSDoc annotations. Because of the different properties that hooks and functions must obey, it’s TypeScript error to pass a value defined as a hook into a position that expects a function type, and an error to pass a regular JavaScript function into a position that expects a hook.

```tsx
import { useState, useEffect } from "react";

/** @hook */
function useMultiplier(x: number): number {
  const [y, setY] = useState(1);
  useEffect(() => {
    setY(0);
  });
  return x * y;
}

/** @component */
function Mapper({ args }: { args: number[] }) {
  const multArgs = args.map(useMultiplier);
  //                        ^^^^^^^^^^^^^
  //                        - ERROR: Expected a function type instead of a React hook

  return multArgs;
}
```

In addition, Hook Annotation enforces that callees with hook-like names inside hooks and components are indeed hooks. We also ensure that callees inside of regular function definitions are never hooks.

```tsx
/** @hook */
function useHook() {
  return null;
}

function regularJavascript() {
  const x = useHook();
  //        ^^^^^^^^^
  //       - ERROR: Cannot call a hook outside of a component or hook
}

/** @component */
function Component() {
  const renamedHook = useHook;
  renamedHook();
  // ^ ERROR: Cannot call a hook outside of a component or hook

  return null;
}
```

## Render Types

A component can declare what it renders using the renders keyword:

```tsx
import * as React from "react";

/**
 * @component
 */
function Header({ size, color }: { size: string; color: string }) {
  return <div />;
}

/**
 * @component
 * @renders Header
 */
function LargeHeader({ color }: { color: string }) {
  return <Header size="large" color={color} />; // Ok!
}
```

When you declare that your component renders some specific element, you can return any component that eventually renders that component in its renders chain:

```tsx
import * as React from "react";

/**
 * @component
 */
function Header({ size, color }: { size: string; color: string }) {
  return <div />;
}

/**
 * @component
 * @renders Header
 */
function LargeHeader({ color }: { color: string }) {
  return <Header size="large" color={color} />;
}

/**
 * @component
 * @renders Header
 */
function LargeBlueHeader() {
  // You could also use `@renders LargeHeader` above
  return <LargeHeader color="blue" />;
}
```

Components can specify props that render specific elements:

```tsx
import * as React from "react";

/**
 * @component
 */
function Header({ size, color, message }: { size: string; color: string; message: string }) {
  return <h1 style={{ color }}>{message}</h1>;
}

interface LayoutProps {
  /**
   * @renders Header
   */
  header: React.ReactElement;
}

/**
 * @component
 */
function Layout({ header }: LayoutProps) {
  return (
    <div>
      {header}
      <section>Hi</section>
    </div>
  );
}
```

And you can pass an element of either Header, or an element of a component that renders `Header`, to that prop:

```tsx
<Layout header={<LargeBlueHeader />} />;
```

You cannot pass a component that does not render a header to a render type expecting a header:

```tsx
import * as React from "react";

/**
 * @component
 */
function Footer() {
  return <footer />;
}

interface HeaderProps {
  size: string;
  color: string;
  message: string;
}

/**
 * @component
 * @renders Header
 */
function Header({ size, color, message }: HeaderProps) {
  return <h1 style={{ color }}>{message}</h1>;
}

interface LayoutProps {
  /**
   * @renders Header
   */
  header: React.ReactElement;
}

/**
 * @component
 */
function Layout({ header }: LayoutProps) {
  return <div>{header}</div>;
}

<Layout header={<Footer />} />;
//              ^^^^^^^^^^
//             - ERROR: `Footer` element does not render `Header` in property `header`. [incompatible-type]
```

### Integrating with a design system

Render types are designed to make integrating with a design system simple. If a prop in the design system component expects a render type, you can copy/paste that type onto your component to integrate with the design system:

```tsx
import * as React from "react";

/**
 * @component
 */
function Header() {
  return <h1>Header!</h1>;
}

interface LayoutProps {
  /**
   * @renders Header
   */
  header: React.ReactElement;
}

/**
 * @component
 * @renders Header
 */
function Layout({ header }: LayoutProps) {
  return <div>{header}</div>;
}

// Copy-paste the header props' type!
/**
 * @component
 * @renders Header
 */
function ProductHeader() {
  // We must return a value that renders a Header to satisfy the signature
  return <Header />;
}

// And now you can integrate with the design system!
<Layout header={<ProductHeader />} />; // OK!
```

### Rendering Optional Elements

​
You may want to describe a component that can take a child that may eventually render an element or nothing. You can use a specialized render type variant `renders?` to achieve this:

```tsx
import * as React from "react";

/**
 * @component
 */
function DesignSystemCardFooter() {
  return <div>Footer Content</div>;
}

interface DesignSystemCardProps {
  children: React.ReactNode;
  /**
   * @renders? DesignSystemCardFooter
   */
  footer?: React.ReactElement;
}

/**
 * @component
 */
function DesignSystemCard({ children, footer }: DesignSystemCardProps) {
  return <div>{children}{footer}</div>;
}

// With these definitions, all of the following work:

<DesignSystemCard footer={<DesignSystemCardFooter />}>Card</DesignSystemCard>;
<DesignSystemCard footer={null}>Card</DesignSystemCard>;
<DesignSystemCard footer={undefined}>Card</DesignSystemCard>;
<DesignSystemCard footer={false}>Card</DesignSystemCard>;

/**
 * @component
 * @renders? DesignSystemCardFooter
 */
function ProductFooter(hasFooter?: boolean) {
  return hasFooter && <DesignSystemCardFooter />;
}

<DesignSystemCard footer={<ProductFooter />}>Card</DesignSystemCard>;
```

### Rendering Lists

You may want to describe a component that can take any amount of children that render a specific element as props. You can use a specialized render type variant `renders*` to achieve this:

```tsx
import * as React from "react";

/**
 * @component
 */
function DesignSystemMenuItem() {
  return <li>Menu Item</li>;
}

interface DesignSystemMenuProps {
  /**
   * @renders* DesignSystemMenuItem
   */
  children: React.ReactNode;
}

function DesignSystemMenu({ children }: DesignSystemMenuProps) {
  return <ul>{children}</ul>;
}

// With these definitions, all of the following work:

const menu1 = (
  <DesignSystemMenu>
    <DesignSystemMenuItem />
  </DesignSystemMenu>
);

const menu2 = (
  <DesignSystemMenu>
    <DesignSystemMenuItem />
    <DesignSystemMenuItem />
  </DesignSystemMenu>
);

const menu3 = (
  <DesignSystemMenu>
    {[
      <DesignSystemMenuItem />,
      <DesignSystemMenuItem />,
    ]}
    <DesignSystemMenuItem />
  </DesignSystemMenu>
);

/**
 * @component
 * @renders* DesignSystemMenuItem
 */
function ProductMenuItem() {
  return <DesignSystemMenuItem />;
}

const menu4 = (
  <DesignSystemMenu>
    {[
      <ProductMenuItem />,
      <DesignSystemMenuItem />,
    ]}
    <DesignSystemMenuItem />
  </DesignSystemMenu>
);
```
