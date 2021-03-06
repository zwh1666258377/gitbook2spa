package main

// html文件模版函数
func RenderHTMLTemplate(bundleName string, versionName string) string {
	return `
	<!DOCTYPE html>
	<html lang="en">

	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="shortcut icon" href="/static/favicon.ico" type="image/x-icon">
		<link rel="stylesheet" type="text/css" href="../../modules/Antd.css" />
		<link rel="stylesheet" type="text/css" href="../../modules/katex.min.css" />
		<script type="text/javascript" src="../../modules/React.js"></script>
		<script type="text/javascript" src="../../modules/ReactDOM.js"></script>
		<script type="text/javascript" src="../../modules/Antd.js"></script>

		<script type="text/javascript" src='./reversion.js'></script>
		<script type="text/javascript">
			const pageName = "` + bundleName + `"
			const versionName = "` + versionName + `"
		</script>
		<style>
			html,
			body {
				color: #242A31;
				width: 100%;
				height: 100%;
				margin: 0;
				padding: 0;
				font-size: 15px;
				box-sizing: border-box;
				font-family: "Roboto", sans-serif;
				line-height: 1em;
				font-smoothing: antialiased;
				text-size-adjust: 100%;
				-ms-text-size-adjust: 100%;
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
				-webkit-text-size-adjust: 100%;
			}
		</style>
		<title>Document</title>
	</head>

	<body>
		<div id='app'></div>
		<script type="text/javascript" src="./` + bundleName + `.js"></script>
	</body>

	</html>
	`
}

// tsx文件模版函数
func RenderTsxTemplate(dom string) string {
	return `
	import * as React from 'react';
	import * as ReactDom from 'react-dom';

	// MarkDown render components
	import { Document } from '@components/Document.tsx';
	import { Block } from '@components/block/index.tsx';
	import { Text } from '@components/Text.tsx';
	import { Inline } from '@components/Inline.tsx';
	import { Sider } from '@components/Sider.tsx';
	import { Header } from '@components/Header.tsx';
	import { Recommend } from '@components/Recommend.tsx';

	export default () => <Header><Sider>` + dom + `</Sider></Header>
	`
}
