import { createContext, useContext, useState, type ReactNode } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  defaultTab: string;
  activeTab?: string;
  onChange?: (tab: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  children,
  className = '',
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);
  const activeTab = controlledActiveTab ?? internalActiveTab;

  function setActiveTab(id: string) {
    if (!controlledActiveTab) {
      setInternalActiveTab(id);
    }
    onChange?.(id);
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`nx-tabs ${className}`.trim()}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`nx-tab-list ${className}`.trim()} role="tablist">
      {children}
    </div>
  );
}

export function Tab({
  id,
  children,
  className = '',
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const isActive = context.activeTab === id;

  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      className={`nx-tab ${isActive ? 'nx-tab--active' : ''} ${className}`.trim()}
      onClick={() => context.setActiveTab(id)}
      type="button"
    >
      {children}
    </button>
  );
}

export function TabPanel({
  id,
  children,
  className = '',
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');

  if (context.activeTab !== id) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={`nx-tab-panel ${className}`.trim()}
    >
      {children}
    </div>
  );
}
