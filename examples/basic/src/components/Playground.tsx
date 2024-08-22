/**
 * @component
 * @renders header
 */
export function Header() {
  return <header></header>;
}

/**
 * @component
 * @renders Header
 */
export function LargeHeader() {
  return <Header />;
}

type PlaygroundProps = {
  /**
   * @renders Header
   */
  header: React.ReactNode;
};

export function Playground({ header }: PlaygroundProps) {
  return (
    <div>
      {header}
      <div className="card">
        <button type="button">count is 0</button>
      </div>
    </div>
  );
}

export function App() {
  return <Playground header={<LargeHeader />} />;
}
