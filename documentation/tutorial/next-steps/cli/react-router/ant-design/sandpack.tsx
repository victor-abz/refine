import React from "react";

import { TutorialSandpack } from "@site/src/refine-theme/tutorial-sandpack";

import { finalFiles as initialFiles } from "@site/tutorial/next-steps/inferencer/react-router/ant-design/sandpack";
import { dependencies } from "@site/tutorial/next-steps/intro/ant-design/sandpack";

export const Sandpack = ({ children }: { children: React.ReactNode }) => {
  return (
    <TutorialSandpack
      showNavigator
      dependencies={dependencies}
      files={initialFiles}
      finalFiles={finalFiles}
    >
      {children}
    </TutorialSandpack>
  );
};

// updates

// actions

// files

export const finalFiles = initialFiles;
