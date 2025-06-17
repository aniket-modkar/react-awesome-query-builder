import React from "react";
import { BasicConfig, Utils } from "@react-awesome-query-builder/ui";
import {default as MaterialWidgets} from "../widgets";
import { generateCssVars } from "../utils/theming";


const settings = {
  ...BasicConfig.settings,

  renderField: (props, {RCE, W: {MaterialFieldAutocomplete, MaterialFieldSelect}}) => props?.customProps?.showSearch 
    ? RCE(MaterialFieldAutocomplete, props)
    : RCE(MaterialFieldSelect, props),
  renderOperator: (props, {RCE, W: {MaterialFieldAutocomplete, MaterialFieldSelect}}) => props?.customProps?.showSearch 
    ? RCE(MaterialFieldAutocomplete, props)
    : RCE(MaterialFieldSelect, props),

  renderFunc: (props, {RCE, W: {MaterialFieldSelect}}) => RCE(MaterialFieldSelect, props),
  renderConjs: (props, {RCE, W: {MaterialConjs}}) => RCE(MaterialConjs, props),
  renderSwitch: (props, {RCE, W: {MaterialSwitch}}) => RCE(MaterialSwitch, props),
  renderButton: (props, {RCE, W: {MaterialButton}}) => RCE(MaterialButton, props),
  renderIcon: (props, {RCE, W: {MaterialIcon}}) => RCE(MaterialIcon, props),
  renderButtonGroup: (props, {RCE, W: {MaterialButtonGroup}}) => RCE(MaterialButtonGroup, props),
  renderValueSources: (props, {RCE, W: {MaterialValueSources}}) => RCE(MaterialValueSources, props),
  renderProvider: (props, {RCE, W: {MaterialProvider}}) => RCE(MaterialProvider, props),
  renderConfirm: (props, {W: {MaterialConfirm}}) => MaterialConfirm(props),
  useConfirm: ({W: {MaterialUseConfirm}}) => MaterialUseConfirm(),
  renderGroup: (props, {RCE, W}) => {
    const { type, properties } = props;
    // W should contain MaterialIfCondition, MaterialElseCondition, and BasicConfig's Group
    const { MaterialIfCondition, MaterialElseCondition, Group: DefaultGroup } = W;

    if (type === "if_group") {
      // Determine if it's 'IF' or 'ELSE IF' based on a property, e.g., 'ifType' or 'isElseIf'
      // For MaterialIfCondition, we designed a 'type' prop: "IF" or "ELSE IF"
      const ifBlockType = properties?.get("isElseIf") ? "ELSE IF" : "IF";
      return RCE(MaterialIfCondition, { ...props, type: ifBlockType });
    } else if (type === "else_group") {
      return RCE(MaterialElseCondition, props);
    } else {
      // Fallback to default group rendering for standard groups
      // Material design should apply via MaterialProvider
      return RCE(DefaultGroup, props);
    }
  },
};


const widgets = {
  ...BasicConfig.widgets,
  text: {
    ...BasicConfig.widgets.text,
    factory: (props, {RCE, W: {MaterialTextWidget}}) => RCE(MaterialTextWidget, props),
  },
  textarea: {
    ...BasicConfig.widgets.textarea,
    factory: (props, {RCE, W: {MaterialTextAreaWidget}}) => RCE(MaterialTextAreaWidget, props),
  },
  number: {
    ...BasicConfig.widgets.number,
    factory: (props, {RCE, W: {MaterialNumberWidget}}) => RCE(MaterialNumberWidget, props),
  },
  price: {
    ...BasicConfig.widgets.price,
    factory: (props, { RCE, W: { MaterialPriceWidget } }) => RCE(MaterialPriceWidget, props),
  },
  multiselect: {
    ...BasicConfig.widgets.multiselect,
    factory: (props, {RCE, W: {MaterialAutocompleteWidget, MaterialMultiSelectWidget}}) => {
      return (props.asyncFetch || props.showSearch || props.allowCustomValues) 
        ? RCE(MaterialAutocompleteWidget, {...props, multiple: true}) 
        : RCE(MaterialMultiSelectWidget, props);
    },
  },
  select: {
    ...BasicConfig.widgets.select,
    factory: (props, {RCE, W: {MaterialAutocompleteWidget, MaterialSelectWidget}}) => {
      return (props.asyncFetch || props.showSearch || props.allowCustomValues) 
        ? RCE(MaterialAutocompleteWidget, props) 
        : RCE(MaterialSelectWidget, props);
    },
  },
  slider: {
    ...BasicConfig.widgets.slider,
    factory: (props, {RCE, W: {MaterialSliderWidget}}) => RCE(MaterialSliderWidget, props),
  },
  boolean: {
    ...BasicConfig.widgets.boolean,
    factory: (props, {RCE, W: {MaterialBooleanWidget}}) => RCE(MaterialBooleanWidget, props),
  },
  date: {
    ...BasicConfig.widgets.date,
    factory: (props, {RCE, W: {MaterialDateWidget}}) => RCE(MaterialDateWidget, props),
  },
  time: {
    ...BasicConfig.widgets.time,
    factory: (props, {RCE, W: {MaterialTimeWidget}}) => RCE(MaterialTimeWidget, props),
  },
  datetime: {
    ...BasicConfig.widgets.datetime,
    factory: (props, {RCE, W: {MaterialDateTimeWidget}}) => RCE(MaterialDateTimeWidget, props),
  },

  rangeslider: {
    ...BasicConfig.widgets.rangeslider,
    factory: (props, {RCE, W: {MaterialRangeWidget}}) => RCE(MaterialRangeWidget, props),
  },
};


const types = {
  ...BasicConfig.types,
};

const ctx = {
  ...BasicConfig.ctx,
  W: {
    ...BasicConfig.ctx.W,
    ...MaterialWidgets,
  },
  generateCssVars,
};

let config = {
  ...BasicConfig,
  ctx,
  types,
  widgets,
  settings,
};
config = Utils.ConfigMixins.addMixins(config, [
  "rangeslider",
]);

export default config;