import React from 'react';
import { Icon, Menu } from 'antd';
import ItemWithMenu from '../../components/item_with_menu';
import './style/index.less';
import { deleteDlg } from '../../components/confirm_dialog/index';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { StringUtil } from '../../utils/string_util';
import { RecordCategory } from '../../common/record_category';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';

interface CollectionItemProps {
    collection: DtoCollection;

    recordCount: number;

    onNameChanged(name: string);

    deleteCollection();

    createFolder(record: DtoRecord);

    moveToCollection(record: DtoRecord, collection?: string);
}

interface CollectionItemState {
    isDragOver?: boolean;
}

const createDefaultFolder: (collectionId: string) => DtoRecord = (cid) => {
    return {
        id: StringUtil.generateUID(),
        name: 'New folder',
        category: RecordCategory.folder,
        collectionId: cid
    };
};

class CollectionItem extends React.Component<CollectionItemProps, CollectionItemState> {

    constructor(props: CollectionItemProps) {
        super(props);
        this.state = {
            isDragOver: false
        };
    }

    itemWithMenu: ItemWithMenu;

    getMenu = () => {
        return (
            <Menu className="item_menu" onClick={this.onClickMenu}>
                <Menu.Item key="edit">
                    <Icon type="edit" /> Rename
                </Menu.Item>
                <Menu.Item key="createFolder">
                    <Icon type="folder" /> Create folder
                </Menu.Item>
                <Menu.Item key="delete">
                    <Icon type="delete" /> Delete
                </Menu.Item>
            </Menu>
        );
    }

    onClickMenu = (e) => {
        this[e.key]();
    }

    delete = () => deleteDlg('collection', () => this.props.deleteCollection());

    edit = () => {
        if (this.itemWithMenu) {
            this.itemWithMenu.edit();
        }
    }

    createFolder = () => this.props.createFolder(createDefaultFolder(this.props.collection.id));

    checkTransferFlag = (e, flag) => {
        return e.dataTransfer.types.indexOf(flag) > -1;
    }

    dragOver = (e) => {
        e.preventDefault();
        if (this.checkTransferFlag(e, 'record') || this.checkTransferFlag(e, 'folder')) {
            this.setState({ ...this.state, isDragOver: true });
        }
    }

    dragLeave = (e) => {
        this.setState({ ...this.state, isDragOver: false });
    }

    drop = (e) => {
        if (this.checkTransferFlag(e, 'record') || this.checkTransferFlag(e, 'folder')) {
            const data = e.dataTransfer.getData('folder') || e.dataTransfer.getData('record');
            const record = JSON.parse(data) as DtoRecord;
            if (record.collectionId !== this.props.collection.id || record.pid) {
                this.props.moveToCollection(record, this.props.collection.id);
            }
        }
        this.setState({ ...this.state, isDragOver: false });
    }

    public render() {

        return (
            <div className={this.state.isDragOver ? 'folder-item-container' : ''}
                onDragOver={this.dragOver}
                onDragLeave={this.dragLeave}
                onDrop={this.drop}
            >
                <ItemWithMenu
                    ref={ele => this.itemWithMenu = ele}
                    onNameChanged={this.props.onNameChanged}
                    icon={<Icon className="c-icon" type="wallet" />}
                    name={this.props.collection.name}
                    subName={<div>{`${this.props.recordCount} request${this.props.recordCount > 1 ? 's' : ''}`}</div>}
                    menu={this.getMenu()}
                />
            </div>
        );
    }
}

export default CollectionItem;