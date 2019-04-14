import { Toolkit } from 'actions-toolkit';

const tools = new Toolkit();
console.log(JSON.stringify(tools.context.payload));
tools.exit.success('Please set environment variable CONFLICT_LABEL_NAME');
