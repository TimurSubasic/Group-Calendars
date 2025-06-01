import React, { createContext, useContext, useState, ReactNode } from "react";

type GroupContextType = {
  groupId: string | null;
  groupName: string | null;
  setGroupId: (id: string | null) => void;
  setGroupName: (name: string | null) => void;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    console.log("useGroup must be used within a GroupProvider");
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
};

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);

  return (
    <GroupContext.Provider
      value={{ groupId, groupName, setGroupId, setGroupName }}
    >
      {children}
    </GroupContext.Provider>
  );
};
