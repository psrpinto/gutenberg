/**
 * Internal dependencies
 */
import { menuItemToBlockAttributes } from '../utils';

describe( 'mapping menu item fields to block attributes', () => {
	const menuItemsToBlockAttrsMapping = [
		{
			menuItem: {
				title: {
					raw: 'Example Page',
					rendered: 'Example Page',
				},
				url: '/example-page/',
				description: 'Lorem ipsum dolor sit amet.',
				xfn: [ 'friend', 'met' ],
				classes: [ 'my-custom-class-one', 'my-custom-class-two' ],
				attr_title: 'Example page link title attribute',
				object_id: 100,
				object: 'page',
				type: 'post_type',
				target: '_blank',
			},
			blockAttrs: {
				label: 'Example Page',
				url: '/example-page/',
				description: 'Lorem ipsum dolor sit amet.',
				rel: 'friend met',
				className: 'my-custom-class-one my-custom-class-two',
				title: 'Example page link title attribute',
				id: 100,
				type: 'page',
				kind: 'post-type',
				opensInNewTab: true,
			},
		},
		{
			menuItem: {
				title: {
					raw: 'Example Post',
					rendered: 'Example Post',
				},
				url: '/example-post/',
				description: 'Consectetur adipiscing elit.',
				xfn: [ 'friend' ],
				classes: [ 'my-custom-class-one' ],
				attr_title: 'Example post link title attribute',
				object_id: 101,
				object: 'post',
				type: 'post_type',
				target: '',
			},
			blockAttrs: {
				label: 'Example Post',
				url: '/example-post/',
				description: 'Consectetur adipiscing elit.',
				rel: 'friend',
				className: 'my-custom-class-one',
				title: 'Example post link title attribute',
				id: 101,
				type: 'post',
				kind: 'post-type',
			},
		},
		{
			menuItem: {
				title: {
					raw: 'Example Category',
					rendered: 'Example Category',
				},
				url: '/example-category/',
				description:
					'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
				xfn: [ '   ', '   ' ],
				classes: [ '   ', ' ' ],
				attr_title: '',
				object_id: 102,
				object: 'category',
				type: 'taxonomy',
				target: '_blank',
			},
			blockAttrs: {
				label: 'Example Category',
				url: '/example-category/',
				description:
					'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
				id: 102,
				type: 'category',
				kind: 'taxonomy',
				opensInNewTab: true,
			},
		},
		{
			menuItem: {
				title: {
					raw: 'Example Tag',
					rendered: 'Example Tag',
				},
				url: '/example-tag/',
				description: '',
				xfn: [ '' ],
				classes: [ '' ],
				attr_title: '',
				object_id: 103,
				object: 'tag',
				type: 'taxonomy',
				target: '',
			},
			blockAttrs: {
				label: 'Example Tag',
				url: '/example-tag/',
				id: 103,
				type: 'tag',
				kind: 'taxonomy',
			},
		},
		{
			menuItem: {
				title: {
					raw: 'Example Custom Link',
					rendered: 'Example Custom Link',
				},
				url: 'https://wordpress.org',
				description: '',
				xfn: [ '' ],
				classes: [ '' ],
				attr_title: '',
				object: 'custom',
				type: 'custom',
				target: '_blank',
			},
			blockAttrs: {
				label: 'Example Custom Link',
				url: 'https://wordpress.org',
				type: 'custom',
				kind: 'custom',
				opensInNewTab: true,
			},
		},
	];

	it( 'maps menu item fields to equivalent block attributes', () => {
		const [ actual, expected ] = menuItemsToBlockAttrsMapping.reduce(
			( acc, item ) => {
				acc[ 0 ].push( menuItemToBlockAttributes( item.menuItem ) );
				acc[ 1 ].push( item.blockAttrs );
				return acc;
			},
			[ [], [] ]
		);

		expect( actual ).toEqual( expected );
	} );

	it( 'does not map menu item "object_id" field to block attribute "id" for custom (non-entity) links', () => {
		const customLinkMenuItem = {
			title: 'Example Custom Link',
			url: 'https://wordpress.org',
			description: '',
			xfn: [ '' ],
			classes: [ '' ],
			attr_title: '',
			object_id: 123456, // added for test purposes.
			object: 'custom',
			type: 'custom',
			target: '_blank',
		};
		const actual = menuItemToBlockAttributes( customLinkMenuItem );

		expect( actual.id ).toBeUndefined();
	} );

	it( 'correctly maps "post_tag" menu item object type to "tag" block type variation', () => {
		const tagMenuItem = {
			title: 'Example Tag',
			url: '/example-tag/',
			object_id: 123456,
			object: 'post_tag',
			type: 'taxonomy',
		};

		const actual = menuItemToBlockAttributes( tagMenuItem );

		expect( actual.type ).toBe( 'tag' );
	} );

	it( 'gracefully handles undefined values by falling back to block attribute defaults', () => {
		// Note that whilst Core provides default values for nav_menu_item's it is possible that these
		// values could be manipulated via Plugins. As such we must account for unexpected values.
		const menuItemsWithUndefinedValues = {
			title: undefined,
			url: undefined,
			description: undefined,
			xfn: undefined,
			classes: undefined,
			attr_title: undefined,
			object_id: undefined,
			object: undefined,
			type: undefined,
			target: undefined,
		};

		const actual = menuItemToBlockAttributes(
			menuItemsWithUndefinedValues
		);

		expect( actual ).toEqual(
			expect.objectContaining( {
				label: '',
				type: 'custom',
				kind: 'custom',
			} )
		);

		expect( Object.keys( actual ) ).not.toEqual(
			expect.arrayContaining( [
				'rel',
				'className',
				'title',
				'id',
				'description',
				'opensInNewTab',
			] )
		);

		expect( Object.values( actual ) ).not.toContain( undefined );
	} );
} );
