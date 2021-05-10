/**
 * External dependencies
 */
import { kebabCase, pickBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	Modal,
	TextControl,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { store as editorStore } from '@wordpress/editor';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { store as editPostStore } from '../../../store';
import { createBlock, serialize } from '@wordpress/blocks';

function PostTemplateActions() {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ title, setTitle ] = useState( '' );
	const { template, supportsTemplateMode, editorSettings } = useSelect(
		( select ) => {
			const { getCurrentPostType } = select( editorStore );
			const { getPostType } = select( coreStore );
			const { getEditedPostTemplate } = select( editPostStore );
			const settings = select( editorStore ).getEditorSettings();

			const isViewable =
				getPostType( getCurrentPostType() )?.viewable ?? false;
			const _supportsTemplateMode =
				settings.supportsTemplateMode && isViewable;

			return {
				template: _supportsTemplateMode && getEditedPostTemplate(),
				supportsTemplateMode: _supportsTemplateMode,
				editorSettings: settings,
			};
		},
		[]
	);
	const { __unstableSwitchToTemplateMode } = useDispatch( editPostStore );
	const { deleteEntityRecord } = useDispatch( 'core' );
	const { updateEditorSettings, editPost } = useDispatch( editorStore );

	if ( ! supportsTemplateMode ) {
		return null;
	}

	return (
		<>
			<div className="edit-post-template__actions">
				{ !! ( template && template.wp_id ) && (
					<Button
						isLink
						isDestructive
						onClick={ () => {
							if (
								// eslint-disable-next-line no-alert
								window.confirm(
									__(
										'Are you sure you want to delete this template? It may be currently in use by other pages or posts.'
									)
								)
							) {
								editPost( {
									template: '',
								} );
								const newAvailableTemplates = pickBy(
									editorSettings.availableTemplates,
									( _title, id ) => {
										return id !== template.slug;
									}
								);
								updateEditorSettings( {
									...editorSettings,
									availableTemplates: newAvailableTemplates,
								} );
								deleteEntityRecord(
									'postType',
									'wp_template',
									template.id
								);
							}
						} }
					>
						{ __( 'Delete' ) }
					</Button>
				) }
				{ !! template && (
					<Button
						isLink
						onClick={ () => __unstableSwitchToTemplateMode() }
					>
						{ __( 'Edit' ) }
					</Button>
				) }
				<Button isLink onClick={ () => setIsModalOpen( true ) }>
					{ __( 'New' ) }
				</Button>
			</div>
			{ isModalOpen && (
				<Modal
					title={ __( 'Create a custom template' ) }
					closeLabel={ __( 'Close' ) }
					onRequestClose={ () => {
						setIsModalOpen( false );
						setTitle( '' );
					} }
					overlayClassName="edit-post-template__modal"
				>
					<form
						onSubmit={ ( event ) => {
							event.preventDefault();
							const defaultTitle = __( 'Custom Template' );
							const templateContent = [
								createBlock( 'core/site-title' ),
								createBlock( 'core/site-tagline' ),
								createBlock( 'core/separator' ),
								createBlock( 'core/post-title' ),
								createBlock( 'core/post-content' ),
							];
							__unstableSwitchToTemplateMode( {
								slug:
									'wp-custom-template-' +
									kebabCase( title ?? defaultTitle ),
								content: serialize( templateContent ),
								title: title ?? defaultTitle,
							} );
							setIsModalOpen( false );
						} }
					>
						<TextControl
							label={ __( 'Name' ) }
							value={ title }
							onChange={ setTitle }
						/>
						<Flex
							className="edit-post-post-template__modal-actions"
							justify="flex-end"
						>
							<FlexItem>
								<Button
									isSecondary
									onClick={ () => {
										setIsModalOpen( false );
										setTitle( '' );
									} }
								>
									{ __( 'Cancel' ) }
								</Button>
							</FlexItem>
							<FlexItem>
								<Button isPrimary type="submit">
									{ __( 'Create' ) }
								</Button>
							</FlexItem>
						</Flex>
					</form>
				</Modal>
			) }
		</>
	);
}

export default PostTemplateActions;
