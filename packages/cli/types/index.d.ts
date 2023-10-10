/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 11:47:07
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-10 17:54:12
 * @FilePath: /vg-cli/packages/cli/types/index.d.ts
 * @Description: 
 */
export enum CloudType {
	alicloud = 'alicloud',
}

export enum FrameworkType {
	vue = 'vue',
	react = 'react',
}

/**
 * Deploy target
 */
export interface DeployTarget {
	id: string;
	type: CloudType;
	bucket: string;
	region: string;
	access_key: string;
	access_secret: string;
	qyapi_key?: string;
	root_path: '/';
	bucket_root_path: '/';//equals to root_path
	web_entry_path: '/';
	uri_rewrite: {
		original?: string;
		original_regexp?: string;
		final?: string;
	} | undefined;
}

/**
 * Whole CI/CD config
 * @property tree_schema string fafafa
 */
export interface CICDConfig {
	tree_schema: string;
	path_schema: string;
	web_type: 'hash'|'history'|'mpa';
	outdir: string;
	target: DeployTarget | DeployTarget[];
	endpoints: EndpointDict;
}

interface EndpointInfo {
  build: string;
  target: string;
  domain: string;
	domains: string[];
	extra_env?:{[env: string]: String};
	web_entry_path?: string;
  uri_rewrite: {
    original: string;
    original_regexp: string;
    final?: string;
  };
}

export interface EndpointDict {
  [dir: string]: EndpointInfo;
}

export interface CIConfigType {
	web_type?: 'hash' | 'history' | 'mpa';
  outdir: string;
  target: DeployTarget | DeployTarget[];
  endpoints: Endpoint[];
}

export interface CMDObj {
	args: string[]; 
	options?: Record<string, boolean>; 
	schema: string; 
	params: string;
}