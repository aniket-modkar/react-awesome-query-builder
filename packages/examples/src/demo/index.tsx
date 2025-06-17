import React, { useState, useCallback, useRef } from "react";
import {
  Query, Builder, Utils, 
  //types:
  BuilderProps, ImmutableTree, Config, ActionMeta, Actions
} from "@react-awesome-query-builder/ui";
import throttle from "lodash/throttle";
import merge from "lodash/merge";
import { ImportSkinStyles } from "../skins";
import loadConfig from "./config";
import {
  useActions, useValidation, useBenchmark, useOutput, useInput, useInitFiles, useConfigChange, useSkins, useBlocksSwitcher,
  useThemeing,
} from "./blocks";
import { initTreeWithValidation, dispatchHmrUpdate, useHmrUpdate } from "./utils";
import type { DemoQueryBuilderState, DemoQueryBuilderMemo } from "./types";
import { emptyTree } from "./init_data";
import { defaultInitFile, initialSkin, validationTranslateOptions, defaultRenderBlocks } from "./options";
import type { LazyStyleModule } from "../skins";
import ConditionalLogicDemo from "./ConditionalLogicDemo"; // Import the new demo
import "./i18n";

// @ts-ignore
import mainStyles from "../styles.scss";
(mainStyles as LazyStyleModule).use();

// Load config and initial tree
const loadedConfig = merge(loadConfig(window._initialSkin || initialSkin), window._configChanges ?? {});
const {tree: initTree, errors: initErrors} = initTreeWithValidation(window._initFile || defaultInitFile, loadedConfig, validationTranslateOptions);

// Trick for HMR: triggers callback put in useHmrUpdate on every update from HMR
dispatchHmrUpdate(loadedConfig, initTree);

//
// Demo component
//
const App: React.FC = () => { // Renamed DemoQueryBuilder to App to avoid confusion
  const memo: React.MutableRefObject<DemoQueryBuilderMemo> = useRef({});
  const [currentDemo, setCurrentDemo] = useState<"standard" | "conditional">("standard");

  const [state, setState] = useState<DemoQueryBuilderState>({
    tree: initTree, // Default tree for standard demo
    initErrors: initErrors,
    config: loadedConfig,
    skin: initialSkin,
    spelStr: "",
    sqlStr: "",
    spelErrors: [] as Array<string>,
    sqlErrors: [] as Array<string>,
    sqlWarnings: [] as Array<string>,
    renderBocks: defaultRenderBlocks,
    initFile: defaultInitFile,
    themeMode: "light", //"auto",
    useOldDesign: false,
    isBodyDark: false,
    renderSize: "small",
    compactMode: false,
    liteMode: true,
    configChanges: {},
  });

  // Trick for HMR
  useHmrUpdate(useCallback(({config}) => {
    // When HMR updates config, re-apply it to the state
    // This might need to be smarter if ConditionalLogicDemo also uses a mutable config
    setState(s => ({ ...s, config }));
  }, []));

  const { renderRunActions } = useActions(state, setState, memo);
  const { renderValidationHeader, renderValidationBlock } = useValidation(state, setState);
  const { renderBenchmarkHeader } = useBenchmark(state, setState, memo);
  const { renderOutput } = useOutput(state);
  const { renderInputs } = useInput(state, setState);
  const { renderConfigChangeHeader } = useConfigChange(state, setState);
  const { renderInitFilesHeader, renderInitErrors } = useInitFiles(state, setState);
  const { renderSkinSelector } = useSkins(state, setState);
  const { renderBlocksSwitcher } = useBlocksSwitcher(state, setState);
  const { renderThemeModeSelector, renderBodyIsDarkSelector, renderUseOldDesignSelector, renderCompactModeSelector, renderLiteModeSelector, renderSizeSelector } = useThemeing(state, setState);

  const renderBuilder = useCallback((bprops: BuilderProps) => {
    return (
      <div className="query-builder-container" style={{padding: "10px"}}>
        <div className="query-builder">
          <Builder {...bprops} />
        </div>
      </div>
    );
  }, []);

  const onChange = useCallback((immutableTree: ImmutableTree, config: Config, actionMeta?: ActionMeta, actions?: Actions) => {
    const isInit = !actionMeta;
    if (actionMeta && state.renderBocks.actions) {
      console.info(actionMeta);
    }
    memo.current.immutableTree = immutableTree;
    memo.current.config = config;
    memo.current.actions = actions;
    updateResult();
  }, [state.renderBocks]);

  const updateResult = throttle(() => {
    setState(prevState => {
      const tree = memo.current.immutableTree!;
      const config = Utils.ConfigUtils.areConfigsSame(memo.current.config, prevState.config) ? prevState.config : memo.current.config;
      return {
        ...prevState,
        tree,
        config,
      };
    });
  }, 100);

  const clearValue = () => {
    setState({
      ...state,
      tree: Utils.loadTree(emptyTree), 
      initErrors: [],
    });
  };

  const builder = state.renderBocks.queryBuilder && currentDemo === "standard" && (
    <Query
      {...state.config}
      value={state.tree}
      onInit={onChange}
      onChange={onChange}
      renderBuilder={renderBuilder}
    />
  );

  const renderDemoSwitcher = () => (
    <div style={{ padding: "10px", borderBottom: "1px solid #ccc", marginBottom: "10px" }}>
      <strong>Select Demo: </strong>
      <button onClick={() => setCurrentDemo("standard")} disabled={currentDemo === "standard"} style={{marginRight: '10px'}}>
        Standard Demo
      </button>
      <button onClick={() => setCurrentDemo("conditional")} disabled={currentDemo === "conditional"}>
        Conditional Logic Demo
      </button>
    </div>
  );

  if (currentDemo === "conditional") {
    return <ConditionalLogicDemo />;
  }

  // Render standard demo
  return (
    <div>
      {renderDemoSwitcher()}
      <div>
        Theme: &nbsp;
        {renderSkinSelector()}
        {renderThemeModeSelector()}
        {renderLiteModeSelector()}
        {renderSizeSelector()}
        {renderCompactModeSelector()}
        {" "}
        {renderBodyIsDarkSelector()}
        {" "}
        {renderUseOldDesignSelector()}
      </div>
      <div>
        Settings: &nbsp;
        {renderConfigChangeHeader()}
      </div>
      <div>
        Output: &nbsp;
        {renderBlocksSwitcher()}
      </div>
      <div>
        Data: &nbsp;
        {renderInitFilesHeader()}
        <button onClick={clearValue}>Clear</button>
        {renderInitErrors()}
        {renderRunActions()}
      </div>
      <div>
        Validation: &nbsp;
        {renderValidationHeader()}
      </div>
      <div>
        Benchmark: &nbsp;
        {renderBenchmarkHeader()}
      </div>

      {renderInputs()}

      <ImportSkinStyles skin={state.skin} />

      {builder}

      <div className="query-builder-result">
        <div>
          {renderValidationBlock()}
          {renderOutput()}
        </div>
      </div>
    </div>
  );
};


export default App;
