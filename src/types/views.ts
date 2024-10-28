
declare interface TableType<T = any> {
	total: number;
	loading: boolean;
	param: {
		page: number;
		page_size: number;
        [key: string]: T;
	};
}

declare interface DialogState {
    isShowDialog: boolean,
    type: string,
    title: string,
    submitTxt: string,
}

// user
declare type ProjectType = {
	id: number;
	project_name: string;
	project_description: string;
	target_server: string;
	file_count: number;
	current_status: string;
	current_status_desc: string;
	created_at: string;
};

interface ProjectTableType extends TableType {
	data: ProjectType[];
}

declare interface ProjectState {
	tableData: ProjectTableType;
}

// user
declare type ProjectUploadType = {
    file_id: number,
    project_id: number,
    filename: string,
    file_size: number,
    file_size_desc: string,
    upload_status: string,
    upload_status_desc: string,
    created_at: string,
};

interface FileUploadTableType extends TableType {
	data: ProjectUploadType[];
}

declare interface FileUploadListState {
	tableData: FileUploadTableType;
    dialog: DialogState;
}

