import "./App.css";

import { useState } from "react";

/**
 * @component
 */
function Header({ children }: { children: React.ReactNode }) {
  return <header>{children}</header>;
}

interface LayoutProps {
  /**
   * @renders Header
   */
  header: React.ReactNode;
  children: React.ReactNode;
}

/**
 * @component
 * @description A simple layout component.
 */
function Layout({ header, children }: LayoutProps) {
  return (
    <div>
      {header}
      <main>{children}</main>
    </div>
  );
}

/**
 * @component
 * @description A simple counter app.
 */
function App() {
  const [count, setCount] = useState<bigint>(0n);

  return (
    <Layout header={<Header>Counter App</Header>}>
      <div className="card">
        <button type="button" onClick={() => setCount((count) => count + 1n)}>
          count is {count.toString()}
        </button>
      </div>
    </Layout>
  );
}

export default App;
