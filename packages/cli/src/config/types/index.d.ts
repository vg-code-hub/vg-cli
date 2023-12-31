/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 11:47:07
 * @LastEditors: zdd dongdong@grizzlychina.com
 * @LastEditTime: 2023-12-15 17:13:03
 * @FilePath: index.d.ts
 * @Description: 
 */


export interface DeployTarget {
	type: 'alicloud';
	bucket: string;
	region: string;
	access_key: string;
	access_secret: string;
	qyapi_key?: string;
	vg_monitor_url?: string;
	vg_monitor_key?: string;
	root_path: '/';
	bucket_root_path: '/';
}

interface EndpointInfo {
  build: string;
	domains: string[];
  uri_rewrite: {
    original: string;
    original_regexp: string;
  };
}

export interface CIConfigType {
	web_type?: 'hash' | 'history' | 'mpa';
  outdir: string;
	path_schema: string;
  target: DeployTarget;
  endpoints: Record<string, EndpointInfo>;
}

export interface CMDObj {
	args: string[];
	options?: {
		params?: string;
		outdir?: string;
		basename?: string;
		config?: boolean;
	}; 
}

export type Config = {
  type: 'dart' | 'typescript';
  cicd: CIConfigType;
  swagger: {
    jsonUrl: string;
    outputDir: string;
    rootPath: string;
    urlPrefix?: string;
    overwrite: boolean;
    ignoreResponse?: string;
    pageResponse?: { name: string; props: string[] };
    folderFilter?: (string | RegExp)[];
    pathHidden?: string[];
    folderMap?: Record<string, string>;
    customPathFolder?: Map<string | RegExp, string>;
    translationObj?: Record<string, string>;
    customModelFolder?: Record<string, string>;
  };
  mock?: {
    exclude: string[];
    include: string[];
  };
};