
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	// Adapted from https://github.com/then/is-promise/blob/master/index.js
	// Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
	/**
	 * @param {any} value
	 * @returns {value is PromiseLike<any>}
	 */
	function is_promise(value) {
		return (
			!!value &&
			(typeof value === 'object' || typeof value === 'function') &&
			typeof (/** @type {any} */ (value).then) === 'function'
		);
	}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @returns {void} */
	function validate_store(store, name) {
		if (store != null && typeof store.subscribe !== 'function') {
			throw new Error(`'${name}' is not a store with a 'subscribe' method`);
		}
	}

	function subscribe(store, ...callbacks) {
		if (store == null) {
			for (const callback of callbacks) {
				callback(undefined);
			}
			return noop;
		}
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}

	/** @returns {void} */
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}

	function create_slot(definition, ctx, $$scope, fn) {
		if (definition) {
			const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
			return definition[0](slot_ctx);
		}
	}

	function get_slot_context(definition, ctx, $$scope, fn) {
		return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
	}

	function get_slot_changes(definition, $$scope, dirty, fn) {
		if (definition[2] && fn) {
			const lets = definition[2](fn(dirty));
			if ($$scope.dirty === undefined) {
				return lets;
			}
			if (typeof lets === 'object') {
				const merged = [];
				const len = Math.max($$scope.dirty.length, lets.length);
				for (let i = 0; i < len; i += 1) {
					merged[i] = $$scope.dirty[i] | lets[i];
				}
				return merged;
			}
			return $$scope.dirty | lets;
		}
		return $$scope.dirty;
	}

	/** @returns {void} */
	function update_slot_base(
		slot,
		slot_definition,
		ctx,
		$$scope,
		slot_changes,
		get_slot_context_fn
	) {
		if (slot_changes) {
			const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
			slot.p(slot_context, slot_changes);
		}
	}

	/** @returns {any[] | -1} */
	function get_all_dirty_from_scope($$scope) {
		if ($$scope.ctx.length > 32) {
			const dirty = [];
			const length = $$scope.ctx.length / 32;
			for (let i = 0; i < length; i++) {
				dirty[i] = -1;
			}
			return dirty;
		}
		return -1;
	}

	/** @returns {{}} */
	function exclude_internal_props(props) {
		const result = {};
		for (const k in props) if (k[0] !== '$') result[k] = props[k];
		return result;
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @returns {(event: any) => any} */
	function prevent_default(fn) {
		return function (event) {
			event.preventDefault();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * Schedules a callback to run immediately before the component is unmounted.
	 *
	 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
	 * only one that runs inside a server-side component.
	 *
	 * https://svelte.dev/docs/svelte#ondestroy
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function onDestroy(fn) {
		get_current_component().$$.on_destroy.push(fn);
	}

	/**
	 * Associates an arbitrary `context` object with the current component and the specified `key`
	 * and returns that object. The context is then available to children of the component
	 * (including slotted content) with `getContext`.
	 *
	 * Like lifecycle functions, this must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#setcontext
	 * @template T
	 * @param {any} key
	 * @param {T} context
	 * @returns {T}
	 */
	function setContext(key, context) {
		get_current_component().$$.context.set(key, context);
		return context;
	}

	/**
	 * Retrieves the context that belongs to the closest parent component with the specified `key`.
	 * Must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#getcontext
	 * @template T
	 * @param {any} key
	 * @returns {T}
	 */
	function getContext(key) {
		return get_current_component().$$.context.get(key);
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	/**
	 * @template T
	 * @param {Promise<T>} promise
	 * @param {import('./private.js').PromiseInfo<T>} info
	 * @returns {boolean}
	 */
	function handle_promise(promise, info) {
		const token = (info.token = {});
		/**
		 * @param {import('./private.js').FragmentFactory} type
		 * @param {0 | 1 | 2} index
		 * @param {number} [key]
		 * @param {any} [value]
		 * @returns {void}
		 */
		function update(type, index, key, value) {
			if (info.token !== token) return;
			info.resolved = value;
			let child_ctx = info.ctx;
			if (key !== undefined) {
				child_ctx = child_ctx.slice();
				child_ctx[key] = value;
			}
			const block = type && (info.current = type)(child_ctx);
			let needs_flush = false;
			if (info.block) {
				if (info.blocks) {
					info.blocks.forEach((block, i) => {
						if (i !== index && block) {
							group_outros();
							transition_out(block, 1, 1, () => {
								if (info.blocks[i] === block) {
									info.blocks[i] = null;
								}
							});
							check_outros();
						}
					});
				} else {
					info.block.d(1);
				}
				block.c();
				transition_in(block, 1);
				block.m(info.mount(), info.anchor);
				needs_flush = true;
			}
			info.block = block;
			if (info.blocks) info.blocks[index] = block;
			if (needs_flush) {
				flush();
			}
		}
		if (is_promise(promise)) {
			const current_component = get_current_component();
			promise.then(
				(value) => {
					set_current_component(current_component);
					update(info.then, 1, info.value, value);
					set_current_component(null);
				},
				(error) => {
					set_current_component(current_component);
					update(info.catch, 2, info.error, error);
					set_current_component(null);
					if (!info.hasCatch) {
						throw error;
					}
				}
			);
			// if we previously had a then/catch block, destroy it
			if (info.current !== info.pending) {
				update(info.pending, 0);
				return true;
			}
		} else {
			if (info.current !== info.then) {
				update(info.then, 1, info.value, promise);
				return true;
			}
			info.resolved = /** @type {T} */ (promise);
		}
	}

	/** @returns {void} */
	function update_await_block_branch(info, ctx, dirty) {
		const child_ctx = ctx.slice();
		const { resolved } = info;
		if (info.current === info.then) {
			child_ctx[info.value] = resolved;
		}
		if (info.current === info.catch) {
			child_ctx[info.error] = resolved;
		}
		info.block.p(child_ctx, dirty);
	}

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {{}} */
	function get_spread_update(levels, updates) {
		const update = {};
		const to_null_out = {};
		const accounted_for = { $$scope: 1 };
		let i = levels.length;
		while (i--) {
			const o = levels[i];
			const n = updates[i];
			if (n) {
				for (const key in o) {
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}

	function get_spread_object(spread_props) {
		return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.19';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	function construct_svelte_component_dev(component, props) {
		const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
		try {
			const instance = new component(props);
			if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
				throw new Error(error_message);
			}
			return instance;
		} catch (err) {
			const { message } = err;
			if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
				throw new Error(error_message);
			} else {
				throw err;
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/** @returns {void} */
	function onMount() {}

	const LOCATION = {};
	const ROUTER = {};
	const HISTORY = {};

	/**
	 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
	 * https://github.com/reach/router/blob/master/LICENSE
	 */

	const PARAM = /^:(.+)/;
	const SEGMENT_POINTS = 4;
	const STATIC_POINTS = 3;
	const DYNAMIC_POINTS = 2;
	const SPLAT_PENALTY = 1;
	const ROOT_POINTS = 1;

	/**
	 * Split up the URI into segments delimited by `/`
	 * Strip starting/ending `/`
	 * @param {string} uri
	 * @return {string[]}
	 */
	const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
	/**
	 * Strip `str` of potential start and end `/`
	 * @param {string} string
	 * @return {string}
	 */
	const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
	/**
	 * Score a route depending on how its individual segments look
	 * @param {object} route
	 * @param {number} index
	 * @return {object}
	 */
	const rankRoute = (route, index) => {
	    const score = route.default
	        ? 0
	        : segmentize(route.path).reduce((score, segment) => {
	              score += SEGMENT_POINTS;

	              if (segment === "") {
	                  score += ROOT_POINTS;
	              } else if (PARAM.test(segment)) {
	                  score += DYNAMIC_POINTS;
	              } else if (segment[0] === "*") {
	                  score -= SEGMENT_POINTS + SPLAT_PENALTY;
	              } else {
	                  score += STATIC_POINTS;
	              }

	              return score;
	          }, 0);

	    return { route, score, index };
	};
	/**
	 * Give a score to all routes and sort them on that
	 * If two routes have the exact same score, we go by index instead
	 * @param {object[]} routes
	 * @return {object[]}
	 */
	const rankRoutes = (routes) =>
	    routes
	        .map(rankRoute)
	        .sort((a, b) =>
	            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
	        );
	/**
	 * Ranks and picks the best route to match. Each segment gets the highest
	 * amount of points, then the type of segment gets an additional amount of
	 * points where
	 *
	 *  static > dynamic > splat > root
	 *
	 * This way we don't have to worry about the order of our routes, let the
	 * computers do it.
	 *
	 * A route looks like this
	 *
	 *  { path, default, value }
	 *
	 * And a returned match looks like:
	 *
	 *  { route, params, uri }
	 *
	 * @param {object[]} routes
	 * @param {string} uri
	 * @return {?object}
	 */
	const pick = (routes, uri) => {
	    let match;
	    let default_;

	    const [uriPathname] = uri.split("?");
	    const uriSegments = segmentize(uriPathname);
	    const isRootUri = uriSegments[0] === "";
	    const ranked = rankRoutes(routes);

	    for (let i = 0, l = ranked.length; i < l; i++) {
	        const route = ranked[i].route;
	        let missed = false;

	        if (route.default) {
	            default_ = {
	                route,
	                params: {},
	                uri,
	            };
	            continue;
	        }

	        const routeSegments = segmentize(route.path);
	        const params = {};
	        const max = Math.max(uriSegments.length, routeSegments.length);
	        let index = 0;

	        for (; index < max; index++) {
	            const routeSegment = routeSegments[index];
	            const uriSegment = uriSegments[index];

	            if (routeSegment && routeSegment[0] === "*") {
	                // Hit a splat, just grab the rest, and return a match
	                // uri:   /files/documents/work
	                // route: /files/* or /files/*splatname
	                const splatName =
	                    routeSegment === "*" ? "*" : routeSegment.slice(1);

	                params[splatName] = uriSegments
	                    .slice(index)
	                    .map(decodeURIComponent)
	                    .join("/");
	                break;
	            }

	            if (typeof uriSegment === "undefined") {
	                // URI is shorter than the route, no match
	                // uri:   /users
	                // route: /users/:userId
	                missed = true;
	                break;
	            }

	            const dynamicMatch = PARAM.exec(routeSegment);

	            if (dynamicMatch && !isRootUri) {
	                const value = decodeURIComponent(uriSegment);
	                params[dynamicMatch[1]] = value;
	            } else if (routeSegment !== uriSegment) {
	                // Current segments don't match, not dynamic, not splat, so no match
	                // uri:   /users/123/settings
	                // route: /users/:id/profile
	                missed = true;
	                break;
	            }
	        }

	        if (!missed) {
	            match = {
	                route,
	                params,
	                uri: "/" + uriSegments.slice(0, index).join("/"),
	            };
	            break;
	        }
	    }

	    return match || default_ || null;
	};
	/**
	 * Combines the `basepath` and the `path` into one path.
	 * @param {string} basepath
	 * @param {string} path
	 */
	const combinePaths = (basepath, path) =>
	    `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;

	const canUseDOM = () =>
	    typeof window !== "undefined" &&
	    "document" in window &&
	    "location" in window;

	/* node_modules/svelte-routing/src/Route.svelte generated by Svelte v4.2.19 */
	const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
	const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

	// (42:0) {#if $activeRoute && $activeRoute.route === route}
	function create_if_block$5(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block_1$1, create_else_block$1];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*component*/ ctx[0]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$5.name,
			type: "if",
			source: "(42:0) {#if $activeRoute && $activeRoute.route === route}",
			ctx
		});

		return block;
	}

	// (51:4) {:else}
	function create_else_block$1(ctx) {
		let current;
		const default_slot_template = /*#slots*/ ctx[8].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

		const block = {
			c: function create() {
				if (default_slot) default_slot.c();
			},
			m: function mount(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope, routeParams*/ 132)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[7],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
							get_default_slot_context$1
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (default_slot) default_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$1.name,
			type: "else",
			source: "(51:4) {:else}",
			ctx
		});

		return block;
	}

	// (43:4) {#if component}
	function create_if_block_1$1(ctx) {
		let await_block_anchor;
		let promise;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: false,
			pending: create_pending_block,
			then: create_then_block,
			catch: create_catch_block,
			value: 12,
			blocks: [,,,]
		};

		handle_promise(promise = /*component*/ ctx[0], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				info.ctx = ctx;

				if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
					update_await_block_branch(info, ctx, dirty);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$1.name,
			type: "if",
			source: "(43:4) {#if component}",
			ctx
		});

		return block;
	}

	// (1:0) <script>     import { getContext, onDestroy }
	function create_catch_block(ctx) {
		const block = {
			c: noop,
			m: noop,
			p: noop,
			i: noop,
			o: noop,
			d: noop
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block.name,
			type: "catch",
			source: "(1:0) <script>     import { getContext, onDestroy }",
			ctx
		});

		return block;
	}

	// (44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
	function create_then_block(ctx) {
		let switch_instance;
		let switch_instance_anchor;
		let current;
		const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
		var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

		function switch_props(ctx, dirty) {
			let switch_instance_props = {};

			for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
			}

			if (dirty !== undefined && dirty & /*routeParams, routeProps*/ 12) {
				switch_instance_props = assign(switch_instance_props, get_spread_update(switch_instance_spread_levels, [
					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
				]));
			}

			return {
				props: switch_instance_props,
				$$inline: true
			};
		}

		if (switch_value) {
			switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
		}

		const block = {
			c: function create() {
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (switch_instance) mount_component(switch_instance, target, anchor);
				insert_dev(target, switch_instance_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx, dirty));
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
					? get_spread_update(switch_instance_spread_levels, [
							dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
							dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
						])
					: {};

					switch_instance.$set(switch_instance_changes);
				}
			},
			i: function intro(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(switch_instance_anchor);
				}

				if (switch_instance) destroy_component(switch_instance, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block.name,
			type: "then",
			source: "(44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}",
			ctx
		});

		return block;
	}

	// (1:0) <script>     import { getContext, onDestroy }
	function create_pending_block(ctx) {
		const block = {
			c: noop,
			m: noop,
			p: noop,
			i: noop,
			o: noop,
			d: noop
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block.name,
			type: "pending",
			source: "(1:0) <script>     import { getContext, onDestroy }",
			ctx
		});

		return block;
	}

	function create_fragment$8(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$5(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*$activeRoute*/ 2) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$5(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$8.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$8($$self, $$props, $$invalidate) {
		let $activeRoute;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Route', slots, ['default']);
		let { path = "" } = $$props;
		let { component = null } = $$props;
		let routeParams = {};
		let routeProps = {};
		const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
		validate_store(activeRoute, 'activeRoute');
		component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

		const route = {
			path,
			// If no path prop is given, this Route will act as the default Route
			// that is rendered if no other Route in the Router is a match.
			default: path === ""
		};

		registerRoute(route);

		onDestroy(() => {
			unregisterRoute(route);
		});

		$$self.$$set = $$new_props => {
			$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
			if ('path' in $$new_props) $$invalidate(6, path = $$new_props.path);
			if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
			if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
		};

		$$self.$capture_state = () => ({
			getContext,
			onDestroy,
			ROUTER,
			canUseDOM,
			path,
			component,
			routeParams,
			routeProps,
			registerRoute,
			unregisterRoute,
			activeRoute,
			route,
			$activeRoute
		});

		$$self.$inject_state = $$new_props => {
			$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
			if ('path' in $$props) $$invalidate(6, path = $$new_props.path);
			if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
			if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
			if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($activeRoute && $activeRoute.route === route) {
				$$invalidate(2, routeParams = $activeRoute.params);
				const { component: c, path, ...rest } = $$props;
				$$invalidate(3, routeProps = rest);

				if (c) {
					if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
				}

				canUseDOM() && window?.scrollTo(0, 0);
			}
		};

		$$props = exclude_internal_props($$props);

		return [
			component,
			$activeRoute,
			routeParams,
			routeProps,
			activeRoute,
			route,
			path,
			$$scope,
			slots
		];
	}

	class Route extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$8, create_fragment$8, safe_not_equal, { path: 6, component: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Route",
				options,
				id: create_fragment$8.name
			});
		}

		get path() {
			throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set path(value) {
			throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get component() {
			throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set component(value) {
			throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	const subscriber_queue = [];

	/**
	 * Creates a `Readable` store that allows reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#readable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Readable<T>}
	 */
	function readable(value, start) {
		return {
			subscribe: writable(value, start).subscribe
		};
	}

	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#writable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Writable<T>}
	 */
	function writable(value, start = noop) {
		/** @type {import('./public.js').Unsubscriber} */
		let stop;
		/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
		const subscribers = new Set();
		/** @param {T} new_value
		 * @returns {void}
		 */
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (const subscriber of subscribers) {
						subscriber[1]();
						subscriber_queue.push(subscriber, value);
					}
					if (run_queue) {
						for (let i = 0; i < subscriber_queue.length; i += 2) {
							subscriber_queue[i][0](subscriber_queue[i + 1]);
						}
						subscriber_queue.length = 0;
					}
				}
			}
		}

		/**
		 * @param {import('./public.js').Updater<T>} fn
		 * @returns {void}
		 */
		function update(fn) {
			set(fn(value));
		}

		/**
		 * @param {import('./public.js').Subscriber<T>} run
		 * @param {import('./private.js').Invalidator<T>} [invalidate]
		 * @returns {import('./public.js').Unsubscriber}
		 */
		function subscribe(run, invalidate = noop) {
			/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
			const subscriber = [run, invalidate];
			subscribers.add(subscriber);
			if (subscribers.size === 1) {
				stop = start(set, update) || noop;
			}
			run(value);
			return () => {
				subscribers.delete(subscriber);
				if (subscribers.size === 0 && stop) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}

	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * https://svelte.dev/docs/svelte-store#derived
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @overload
	 * @param {S} stores - input stores
	 * @param {(values: import('./private.js').StoresValues<S>, set: (value: T) => void, update: (fn: import('./public.js').Updater<T>) => void) => import('./public.js').Unsubscriber | void} fn - function callback that aggregates the values
	 * @param {T} [initial_value] - initial value
	 * @returns {import('./public.js').Readable<T>}
	 */

	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * https://svelte.dev/docs/svelte-store#derived
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @overload
	 * @param {S} stores - input stores
	 * @param {(values: import('./private.js').StoresValues<S>) => T} fn - function callback that aggregates the values
	 * @param {T} [initial_value] - initial value
	 * @returns {import('./public.js').Readable<T>}
	 */

	/**
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @param {S} stores
	 * @param {Function} fn
	 * @param {T} [initial_value]
	 * @returns {import('./public.js').Readable<T>}
	 */
	function derived(stores, fn, initial_value) {
		const single = !Array.isArray(stores);
		/** @type {Array<import('./public.js').Readable<any>>} */
		const stores_array = single ? [stores] : stores;
		if (!stores_array.every(Boolean)) {
			throw new Error('derived() expects stores as input, got a falsy value');
		}
		const auto = fn.length < 2;
		return readable(initial_value, (set, update) => {
			let started = false;
			const values = [];
			let pending = 0;
			let cleanup = noop;
			const sync = () => {
				if (pending) {
					return;
				}
				cleanup();
				const result = fn(single ? values[0] : values, set, update);
				if (auto) {
					set(result);
				} else {
					cleanup = is_function(result) ? result : noop;
				}
			};
			const unsubscribers = stores_array.map((store, i) =>
				subscribe(
					store,
					(value) => {
						values[i] = value;
						pending &= ~(1 << i);
						if (started) {
							sync();
						}
					},
					() => {
						pending |= 1 << i;
					}
				)
			);
			started = true;
			sync();
			return function stop() {
				run_all(unsubscribers);
				cleanup();
				// We need to set this to false because callbacks can still happen despite having unsubscribed:
				// Callbacks might already be placed in the queue which doesn't know it should no longer
				// invoke this derived store.
				started = false;
			};
		});
	}

	/**
	 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
	 * https://github.com/reach/router/blob/master/LICENSE
	 */

	const getLocation = (source) => {
	    return {
	        ...source.location,
	        state: source.history.state,
	        key: (source.history.state && source.history.state.key) || "initial",
	    };
	};
	const createHistory = (source) => {
	    const listeners = [];
	    let location = getLocation(source);

	    return {
	        get location() {
	            return location;
	        },

	        listen(listener) {
	            listeners.push(listener);

	            const popstateListener = () => {
	                location = getLocation(source);
	                listener({ location, action: "POP" });
	            };

	            source.addEventListener("popstate", popstateListener);

	            return () => {
	                source.removeEventListener("popstate", popstateListener);
	                const index = listeners.indexOf(listener);
	                listeners.splice(index, 1);
	            };
	        },

	        navigate(to, { state, replace = false } = {}) {
	            state = { ...state, key: Date.now() + "" };
	            // try...catch iOS Safari limits to 100 pushState calls
	            try {
	                if (replace) source.history.replaceState(state, "", to);
	                else source.history.pushState(state, "", to);
	            } catch (e) {
	                source.location[replace ? "replace" : "assign"](to);
	            }
	            location = getLocation(source);
	            listeners.forEach((listener) =>
	                listener({ location, action: "PUSH" })
	            );
	            document.activeElement.blur();
	        },
	    };
	};
	// Stores history entries in memory for testing or other platforms like Native
	const createMemorySource = (initialPathname = "/") => {
	    let index = 0;
	    const stack = [{ pathname: initialPathname, search: "" }];
	    const states = [];

	    return {
	        get location() {
	            return stack[index];
	        },
	        addEventListener(name, fn) {},
	        removeEventListener(name, fn) {},
	        history: {
	            get entries() {
	                return stack;
	            },
	            get index() {
	                return index;
	            },
	            get state() {
	                return states[index];
	            },
	            pushState(state, _, uri) {
	                const [pathname, search = ""] = uri.split("?");
	                index++;
	                stack.push({ pathname, search });
	                states.push(state);
	            },
	            replaceState(state, _, uri) {
	                const [pathname, search = ""] = uri.split("?");
	                stack[index] = { pathname, search };
	                states[index] = state;
	            },
	        },
	    };
	};
	// Global history uses window.history as the source if available,
	// otherwise a memory history
	const globalHistory = createHistory(
	    canUseDOM() ? window : createMemorySource()
	);
	const { navigate } = globalHistory;

	/* node_modules/svelte-routing/src/Router.svelte generated by Svelte v4.2.19 */

	const { Object: Object_1 } = globals;

	const get_default_slot_changes = dirty => ({
		route: dirty & /*$activeRoute*/ 2,
		location: dirty & /*$location*/ 1
	});

	const get_default_slot_context = ctx => ({
		route: /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].uri,
		location: /*$location*/ ctx[0]
	});

	function create_fragment$7(ctx) {
		let current;
		const default_slot_template = /*#slots*/ ctx[12].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], get_default_slot_context);

		const block = {
			c: function create() {
				if (default_slot) default_slot.c();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 2051)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[11],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, get_default_slot_changes),
							get_default_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (default_slot) default_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$7.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$7($$self, $$props, $$invalidate) {
		let $location;
		let $routes;
		let $base;
		let $activeRoute;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Router', slots, ['default']);
		let { basepath = "/" } = $$props;
		let { url = null } = $$props;
		let { history = globalHistory } = $$props;
		setContext(HISTORY, history);
		const locationContext = getContext(LOCATION);
		const routerContext = getContext(ROUTER);
		const routes = writable([]);
		validate_store(routes, 'routes');
		component_subscribe($$self, routes, value => $$invalidate(9, $routes = value));
		const activeRoute = writable(null);
		validate_store(activeRoute, 'activeRoute');
		component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
		let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

		// If locationContext is not set, this is the topmost Router in the tree.
		// If the `url` prop is given we force the location to it.
		const location = locationContext || writable(url ? { pathname: url } : history.location);

		validate_store(location, 'location');
		component_subscribe($$self, location, value => $$invalidate(0, $location = value));

		// If routerContext is set, the routerBase of the parent Router
		// will be the base for this Router's descendants.
		// If routerContext is not set, the path and resolved uri will both
		// have the value of the basepath prop.
		const base = routerContext
		? routerContext.routerBase
		: writable({ path: basepath, uri: basepath });

		validate_store(base, 'base');
		component_subscribe($$self, base, value => $$invalidate(10, $base = value));

		const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
			// If there is no activeRoute, the routerBase will be identical to the base.
			if (!activeRoute) return base;

			const { path: basepath } = base;
			const { route, uri } = activeRoute;

			// Remove the potential /* or /*splatname from
			// the end of the child Routes relative paths.
			const path = route.default
			? basepath
			: route.path.replace(/\*.*$/, "");

			return { path, uri };
		});

		const registerRoute = route => {
			const { path: basepath } = $base;
			let { path } = route;

			// We store the original path in the _path property so we can reuse
			// it when the basepath changes. The only thing that matters is that
			// the route reference is intact, so mutation is fine.
			route._path = path;

			route.path = combinePaths(basepath, path);

			if (typeof window === "undefined") {
				// In SSR we should set the activeRoute immediately if it is a match.
				// If there are more Routes being registered after a match is found,
				// we just skip them.
				if (hasActiveRoute) return;

				const matchingRoute = pick([route], $location.pathname);

				if (matchingRoute) {
					activeRoute.set(matchingRoute);
					hasActiveRoute = true;
				}
			} else {
				routes.update(rs => [...rs, route]);
			}
		};

		const unregisterRoute = route => {
			routes.update(rs => rs.filter(r => r !== route));
		};

		if (!locationContext) {

			setContext(LOCATION, location);
		}

		setContext(ROUTER, {
			activeRoute,
			base,
			routerBase,
			registerRoute,
			unregisterRoute
		});

		const writable_props = ['basepath', 'url', 'history'];

		Object_1.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('basepath' in $$props) $$invalidate(6, basepath = $$props.basepath);
			if ('url' in $$props) $$invalidate(7, url = $$props.url);
			if ('history' in $$props) $$invalidate(8, history = $$props.history);
			if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
		};

		$$self.$capture_state = () => ({
			getContext,
			onMount,
			setContext,
			derived,
			writable,
			HISTORY,
			LOCATION,
			ROUTER,
			globalHistory,
			combinePaths,
			pick,
			basepath,
			url,
			history,
			locationContext,
			routerContext,
			routes,
			activeRoute,
			hasActiveRoute,
			location,
			base,
			routerBase,
			registerRoute,
			unregisterRoute,
			$location,
			$routes,
			$base,
			$activeRoute
		});

		$$self.$inject_state = $$props => {
			if ('basepath' in $$props) $$invalidate(6, basepath = $$props.basepath);
			if ('url' in $$props) $$invalidate(7, url = $$props.url);
			if ('history' in $$props) $$invalidate(8, history = $$props.history);
			if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*$base*/ 1024) {
				// This reactive statement will update all the Routes' path when
				// the basepath changes.
				{
					const { path: basepath } = $base;
					routes.update(rs => rs.map(r => Object.assign(r, { path: combinePaths(basepath, r._path) })));
				}
			}

			if ($$self.$$.dirty & /*$routes, $location*/ 513) {
				// This reactive statement will be run when the Router is created
				// when there are no Routes and then again the following tick, so it
				// will not find an active Route in SSR and in the browser it will only
				// pick an active Route after all Routes have been registered.
				{
					const bestMatch = pick($routes, $location.pathname);
					activeRoute.set(bestMatch);
				}
			}
		};

		return [
			$location,
			$activeRoute,
			routes,
			activeRoute,
			location,
			base,
			basepath,
			url,
			history,
			$routes,
			$base,
			$$scope,
			slots
		];
	}

	class Router extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$7, create_fragment$7, safe_not_equal, { basepath: 6, url: 7, history: 8 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Router",
				options,
				id: create_fragment$7.name
			});
		}

		get basepath() {
			throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set basepath(value) {
			throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get url() {
			throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set url(value) {
			throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get history() {
			throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set history(value) {
			throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/components/Nav.svelte generated by Svelte v4.2.19 */
	const file$5 = "src/components/Nav.svelte";

	// (19:2) {:else}
	function create_else_block(ctx) {
		let a0;
		let t1;
		let a1;

		const block = {
			c: function create() {
				a0 = element("a");
				a0.textContent = "Login";
				t1 = space();
				a1 = element("a");
				a1.textContent = "Register";
				attr_dev(a0, "href", "/login");
				attr_dev(a0, "class", "svelte-dgtpne");
				add_location(a0, file$5, 19, 4, 438);
				attr_dev(a1, "href", "/register");
				attr_dev(a1, "class", "svelte-dgtpne");
				add_location(a1, file$5, 20, 4, 469);
			},
			m: function mount(target, anchor) {
				insert_dev(target, a0, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, a1, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(a0);
					detach_dev(t1);
					detach_dev(a1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(19:2) {:else}",
			ctx
		});

		return block;
	}

	// (16:2) {#if isAuthenticated}
	function create_if_block$4(ctx) {
		let a;
		let t1;
		let button;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				a = element("a");
				a.textContent = "Calendar";
				t1 = space();
				button = element("button");
				button.textContent = "Logout";
				attr_dev(a, "href", "/calendar");
				attr_dev(a, "class", "svelte-dgtpne");
				add_location(a, file$5, 16, 4, 345);
				attr_dev(button, "class", "svelte-dgtpne");
				add_location(button, file$5, 17, 4, 382);
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, button, anchor);

				if (!mounted) {
					dispose = listen_dev(button, "click", /*logout*/ ctx[1], false, false, false, false);
					mounted = true;
				}
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(a);
					detach_dev(t1);
					detach_dev(button);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$4.name,
			type: "if",
			source: "(16:2) {#if isAuthenticated}",
			ctx
		});

		return block;
	}

	function create_fragment$6(ctx) {
		let nav;
		let a;
		let t1;

		function select_block_type(ctx, dirty) {
			if (/*isAuthenticated*/ ctx[0]) return create_if_block$4;
			return create_else_block;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				nav = element("nav");
				a = element("a");
				a.textContent = "Home";
				t1 = space();
				if_block.c();
				attr_dev(a, "href", "/");
				attr_dev(a, "class", "svelte-dgtpne");
				add_location(a, file$5, 14, 2, 296);
				attr_dev(nav, "class", "svelte-dgtpne");
				add_location(nav, file$5, 13, 0, 288);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, nav, anchor);
				append_dev(nav, a);
				append_dev(nav, t1);
				if_block.m(nav, null);
			},
			p: function update(ctx, [dirty]) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(nav, null);
					}
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(nav);
				}

				if_block.d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$6.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$6($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Nav', slots, []);
		let isAuthenticated = false;

		const logout = () => {
			localStorage.removeItem('token');
			$$invalidate(0, isAuthenticated = false);
			navigate('/login');
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ navigate, isAuthenticated, logout });

		$$self.$inject_state = $$props => {
			if ('isAuthenticated' in $$props) $$invalidate(0, isAuthenticated = $$props.isAuthenticated);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$invalidate(0, isAuthenticated = localStorage.getItem('token') ? true : false);
		return [isAuthenticated, logout];
	}

	class Nav extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Nav",
				options,
				id: create_fragment$6.name
			});
		}
	}

	/* src/routes/Home.svelte generated by Svelte v4.2.19 */
	const file$4 = "src/routes/Home.svelte";

	function create_fragment$5(ctx) {
		let h1;

		const block = {
			c: function create() {
				h1 = element("h1");
				h1.textContent = "Welcome to the Calendar Application";
				add_location(h1, file$4, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, h1, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$5.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$5($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Home', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Home extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Home",
				options,
				id: create_fragment$5.name
			});
		}
	}

	/* src/routes/Login.svelte generated by Svelte v4.2.19 */
	const file$3 = "src/routes/Login.svelte";

	// (28:0) {#if error}
	function create_if_block$3(ctx) {
		let div;
		let t;

		const block = {
			c: function create() {
				div = element("div");
				t = text(/*error*/ ctx[2]);
				attr_dev(div, "class", "error");
				add_location(div, file$3, 28, 2, 663);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*error*/ 4) set_data_dev(t, /*error*/ ctx[2]);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$3.name,
			type: "if",
			source: "(28:0) {#if error}",
			ctx
		});

		return block;
	}

	function create_fragment$4(ctx) {
		let h2;
		let t1;
		let t2;
		let form;
		let input0;
		let t3;
		let input1;
		let t4;
		let button;
		let mounted;
		let dispose;
		let if_block = /*error*/ ctx[2] && create_if_block$3(ctx);

		const block = {
			c: function create() {
				h2 = element("h2");
				h2.textContent = "Login";
				t1 = space();
				if (if_block) if_block.c();
				t2 = space();
				form = element("form");
				input0 = element("input");
				t3 = space();
				input1 = element("input");
				t4 = space();
				button = element("button");
				button.textContent = "Login";
				add_location(h2, file$3, 26, 0, 634);
				attr_dev(input0, "type", "text");
				attr_dev(input0, "placeholder", "Username");
				input0.required = true;
				add_location(input0, file$3, 31, 2, 744);
				attr_dev(input1, "type", "password");
				attr_dev(input1, "placeholder", "Password");
				input1.required = true;
				add_location(input1, file$3, 32, 2, 822);
				attr_dev(button, "type", "submit");
				add_location(button, file$3, 33, 2, 904);
				add_location(form, file$3, 30, 0, 702);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, h2, anchor);
				insert_dev(target, t1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, t2, anchor);
				insert_dev(target, form, anchor);
				append_dev(form, input0);
				set_input_value(input0, /*username*/ ctx[0]);
				append_dev(form, t3);
				append_dev(form, input1);
				set_input_value(input1, /*password*/ ctx[1]);
				append_dev(form, t4);
				append_dev(form, button);

				if (!mounted) {
					dispose = [
						listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
						listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
						listen_dev(form, "submit", prevent_default(/*login*/ ctx[3]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (/*error*/ ctx[2]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block$3(ctx);
						if_block.c();
						if_block.m(t2.parentNode, t2);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
					set_input_value(input0, /*username*/ ctx[0]);
				}

				if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
					set_input_value(input1, /*password*/ ctx[1]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h2);
					detach_dev(t1);
					detach_dev(t2);
					detach_dev(form);
				}

				if (if_block) if_block.d(detaching);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$4.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$4($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Login', slots, []);
		let username = '';
		let password = '';
		let error = '';

		const login = async () => {
			try {
				const response = await fetch('/auth/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username, password })
				});

				const data = await response.json();

				if (response.ok) {
					localStorage.setItem('token', data.access_token);
					navigate('/calendar');
				} else {
					$$invalidate(2, error = data.msg);
				}
			} catch(err) {
				$$invalidate(2, error = 'An error occurred');
			}
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
		});

		function input0_input_handler() {
			username = this.value;
			$$invalidate(0, username);
		}

		function input1_input_handler() {
			password = this.value;
			$$invalidate(1, password);
		}

		$$self.$capture_state = () => ({
			navigate,
			username,
			password,
			error,
			login
		});

		$$self.$inject_state = $$props => {
			if ('username' in $$props) $$invalidate(0, username = $$props.username);
			if ('password' in $$props) $$invalidate(1, password = $$props.password);
			if ('error' in $$props) $$invalidate(2, error = $$props.error);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [username, password, error, login, input0_input_handler, input1_input_handler];
	}

	class Login extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Login",
				options,
				id: create_fragment$4.name
			});
		}
	}

	/* src/routes/Register.svelte generated by Svelte v4.2.19 */
	const file$2 = "src/routes/Register.svelte";

	// (29:0) {#if error}
	function create_if_block_1(ctx) {
		let div;
		let t;

		const block = {
			c: function create() {
				div = element("div");
				t = text(/*error*/ ctx[2]);
				attr_dev(div, "class", "error");
				add_location(div, file$2, 29, 2, 659);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*error*/ 4) set_data_dev(t, /*error*/ ctx[2]);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(29:0) {#if error}",
			ctx
		});

		return block;
	}

	// (32:0) {#if success}
	function create_if_block$2(ctx) {
		let div;
		let t;

		const block = {
			c: function create() {
				div = element("div");
				t = text(/*success*/ ctx[3]);
				attr_dev(div, "class", "success");
				add_location(div, file$2, 32, 2, 714);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*success*/ 8) set_data_dev(t, /*success*/ ctx[3]);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$2.name,
			type: "if",
			source: "(32:0) {#if success}",
			ctx
		});

		return block;
	}

	function create_fragment$3(ctx) {
		let h2;
		let t1;
		let t2;
		let t3;
		let form;
		let input0;
		let t4;
		let input1;
		let t5;
		let button;
		let mounted;
		let dispose;
		let if_block0 = /*error*/ ctx[2] && create_if_block_1(ctx);
		let if_block1 = /*success*/ ctx[3] && create_if_block$2(ctx);

		const block = {
			c: function create() {
				h2 = element("h2");
				h2.textContent = "Register";
				t1 = space();
				if (if_block0) if_block0.c();
				t2 = space();
				if (if_block1) if_block1.c();
				t3 = space();
				form = element("form");
				input0 = element("input");
				t4 = space();
				input1 = element("input");
				t5 = space();
				button = element("button");
				button.textContent = "Register";
				add_location(h2, file$2, 27, 0, 627);
				attr_dev(input0, "type", "text");
				attr_dev(input0, "placeholder", "Username");
				input0.required = true;
				add_location(input0, file$2, 35, 2, 802);
				attr_dev(input1, "type", "password");
				attr_dev(input1, "placeholder", "Password");
				input1.required = true;
				add_location(input1, file$2, 36, 2, 880);
				attr_dev(button, "type", "submit");
				add_location(button, file$2, 37, 2, 962);
				add_location(form, file$2, 34, 0, 757);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, h2, anchor);
				insert_dev(target, t1, anchor);
				if (if_block0) if_block0.m(target, anchor);
				insert_dev(target, t2, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert_dev(target, t3, anchor);
				insert_dev(target, form, anchor);
				append_dev(form, input0);
				set_input_value(input0, /*username*/ ctx[0]);
				append_dev(form, t4);
				append_dev(form, input1);
				set_input_value(input1, /*password*/ ctx[1]);
				append_dev(form, t5);
				append_dev(form, button);

				if (!mounted) {
					dispose = [
						listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
						listen_dev(input1, "input", /*input1_input_handler*/ ctx[6]),
						listen_dev(form, "submit", prevent_default(/*register*/ ctx[4]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (/*error*/ ctx[2]) {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_1(ctx);
						if_block0.c();
						if_block0.m(t2.parentNode, t2);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (/*success*/ ctx[3]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block$2(ctx);
						if_block1.c();
						if_block1.m(t3.parentNode, t3);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
					set_input_value(input0, /*username*/ ctx[0]);
				}

				if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
					set_input_value(input1, /*password*/ ctx[1]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h2);
					detach_dev(t1);
					detach_dev(t2);
					detach_dev(t3);
					detach_dev(form);
				}

				if (if_block0) if_block0.d(detaching);
				if (if_block1) if_block1.d(detaching);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Register', slots, []);
		let username = '';
		let password = '';
		let error = '';
		let success = '';

		const register = async () => {
			try {
				const response = await fetch('/auth/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username, password })
				});

				const data = await response.json();

				if (response.ok) {
					$$invalidate(3, success = data.msg);
					navigate('/login');
				} else {
					$$invalidate(2, error = data.msg);
				}
			} catch(err) {
				$$invalidate(2, error = 'An error occurred');
			}
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Register> was created with unknown prop '${key}'`);
		});

		function input0_input_handler() {
			username = this.value;
			$$invalidate(0, username);
		}

		function input1_input_handler() {
			password = this.value;
			$$invalidate(1, password);
		}

		$$self.$capture_state = () => ({
			navigate,
			username,
			password,
			error,
			success,
			register
		});

		$$self.$inject_state = $$props => {
			if ('username' in $$props) $$invalidate(0, username = $$props.username);
			if ('password' in $$props) $$invalidate(1, password = $$props.password);
			if ('error' in $$props) $$invalidate(2, error = $$props.error);
			if ('success' in $$props) $$invalidate(3, success = $$props.success);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			username,
			password,
			error,
			success,
			register,
			input0_input_handler,
			input1_input_handler
		];
	}

	class Register extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Register",
				options,
				id: create_fragment$3.name
			});
		}
	}

	/* src/routes/Calendar.svelte generated by Svelte v4.2.19 */
	const file$1 = "src/routes/Calendar.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[6] = list[i];
		return child_ctx;
	}

	// (39:0) {#if error}
	function create_if_block$1(ctx) {
		let div;
		let t;

		const block = {
			c: function create() {
				div = element("div");
				t = text(/*error*/ ctx[1]);
				attr_dev(div, "class", "error");
				add_location(div, file$1, 39, 2, 782);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*error*/ 2) set_data_dev(t, /*error*/ ctx[1]);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$1.name,
			type: "if",
			source: "(39:0) {#if error}",
			ctx
		});

		return block;
	}

	// (44:2) {#each events as event}
	function create_each_block(ctx) {
		let li;
		let strong;
		let t0_value = /*event*/ ctx[6].title + "";
		let t0;
		let t1;
		let t2_value = /*event*/ ctx[6].start_time + "";
		let t2;
		let t3;
		let t4_value = /*event*/ ctx[6].end_time + "";
		let t4;
		let t5;
		let button;
		let t7;
		let mounted;
		let dispose;

		function click_handler() {
			return /*click_handler*/ ctx[4](/*event*/ ctx[6]);
		}

		const block = {
			c: function create() {
				li = element("li");
				strong = element("strong");
				t0 = text(t0_value);
				t1 = text(" (");
				t2 = text(t2_value);
				t3 = text(" - ");
				t4 = text(t4_value);
				t5 = text(")\n      ");
				button = element("button");
				button.textContent = "Edit";
				t7 = space();
				add_location(strong, file$1, 45, 6, 918);
				add_location(button, file$1, 46, 6, 995);
				add_location(li, file$1, 44, 4, 907);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
				append_dev(li, strong);
				append_dev(strong, t0);
				append_dev(li, t1);
				append_dev(li, t2);
				append_dev(li, t3);
				append_dev(li, t4);
				append_dev(li, t5);
				append_dev(li, button);
				append_dev(li, t7);

				if (!mounted) {
					dispose = listen_dev(button, "click", click_handler, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*events*/ 1 && t0_value !== (t0_value = /*event*/ ctx[6].title + "")) set_data_dev(t0, t0_value);
				if (dirty & /*events*/ 1 && t2_value !== (t2_value = /*event*/ ctx[6].start_time + "")) set_data_dev(t2, t2_value);
				if (dirty & /*events*/ 1 && t4_value !== (t4_value = /*event*/ ctx[6].end_time + "")) set_data_dev(t4, t4_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(44:2) {#each events as event}",
			ctx
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let h2;
		let t1;
		let t2;
		let button;
		let t4;
		let ul;
		let mounted;
		let dispose;
		let if_block = /*error*/ ctx[1] && create_if_block$1(ctx);
		let each_value = ensure_array_like_dev(/*events*/ ctx[0]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				h2 = element("h2");
				h2.textContent = "Your Events";
				t1 = space();
				if (if_block) if_block.c();
				t2 = space();
				button = element("button");
				button.textContent = "Add New Event";
				t4 = space();
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				add_location(h2, file$1, 37, 0, 747);
				add_location(button, file$1, 41, 0, 821);
				add_location(ul, file$1, 42, 0, 872);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, h2, anchor);
				insert_dev(target, t1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, t2, anchor);
				insert_dev(target, button, anchor);
				insert_dev(target, t4, anchor);
				insert_dev(target, ul, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul, null);
					}
				}

				if (!mounted) {
					dispose = listen_dev(button, "click", /*addEvent*/ ctx[2], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (/*error*/ ctx[1]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block$1(ctx);
						if_block.c();
						if_block.m(t2.parentNode, t2);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (dirty & /*editEvent, events*/ 9) {
					each_value = ensure_array_like_dev(/*events*/ ctx[0]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h2);
					detach_dev(t1);
					detach_dev(t2);
					detach_dev(button);
					detach_dev(t4);
					detach_dev(ul);
				}

				if (if_block) if_block.d(detaching);
				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Calendar', slots, []);
		let events = [];
		let error = '';

		const fetchEvents = async () => {
			try {
				const response = await fetch('/api/events', {
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('token')}`
					}
				});

				const data = await response.json();

				if (response.ok) {
					$$invalidate(0, events = data.events);
				} else {
					$$invalidate(1, error = data.msg);

					if (response.status === 401) {
						navigate('/login');
					}
				}
			} catch(err) {
				$$invalidate(1, error = 'An error occurred');
			}
		};

		fetchEvents();

		const addEvent = () => {
			navigate('/event/new');
		};

		const editEvent = id => {
			navigate(`/event/${id}`);
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Calendar> was created with unknown prop '${key}'`);
		});

		const click_handler = event => editEvent(event.id);

		$$self.$capture_state = () => ({
			navigate,
			events,
			error,
			fetchEvents,
			addEvent,
			editEvent
		});

		$$self.$inject_state = $$props => {
			if ('events' in $$props) $$invalidate(0, events = $$props.events);
			if ('error' in $$props) $$invalidate(1, error = $$props.error);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [events, error, addEvent, editEvent, click_handler];
	}

	class Calendar extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Calendar",
				options,
				id: create_fragment$2.name
			});
		}
	}

	/* src/routes/Event.svelte generated by Svelte v4.2.19 */
	const file = "src/routes/Event.svelte";

	// (61:0) {#if error}
	function create_if_block(ctx) {
		let div;
		let t;

		const block = {
			c: function create() {
				div = element("div");
				t = text(/*error*/ ctx[4]);
				attr_dev(div, "class", "error");
				add_location(div, file, 61, 2, 1585);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*error*/ 16) set_data_dev(t, /*error*/ ctx[4]);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(61:0) {#if error}",
			ctx
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let h2;
		let t0_value = (/*isEditing*/ ctx[5] ? 'Edit' : 'New') + "";
		let t0;
		let t1;
		let t2;
		let t3;
		let form;
		let input0;
		let t4;
		let textarea;
		let t5;
		let input1;
		let t6;
		let input2;
		let t7;
		let button;
		let mounted;
		let dispose;
		let if_block = /*error*/ ctx[4] && create_if_block(ctx);

		const block = {
			c: function create() {
				h2 = element("h2");
				t0 = text(t0_value);
				t1 = text(" Event");
				t2 = space();
				if (if_block) if_block.c();
				t3 = space();
				form = element("form");
				input0 = element("input");
				t4 = space();
				textarea = element("textarea");
				t5 = space();
				input1 = element("input");
				t6 = space();
				input2 = element("input");
				t7 = space();
				button = element("button");
				button.textContent = "Save";
				add_location(h2, file, 59, 0, 1527);
				attr_dev(input0, "type", "text");
				attr_dev(input0, "placeholder", "Title");
				input0.required = true;
				add_location(input0, file, 64, 2, 1670);
				attr_dev(textarea, "placeholder", "Description");
				add_location(textarea, file, 65, 2, 1742);
				attr_dev(input1, "type", "datetime-local");
				input1.required = true;
				add_location(input1, file, 66, 2, 1817);
				attr_dev(input2, "type", "datetime-local");
				input2.required = true;
				add_location(input2, file, 67, 2, 1884);
				attr_dev(button, "type", "submit");
				add_location(button, file, 68, 2, 1949);
				add_location(form, file, 63, 0, 1624);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, h2, anchor);
				append_dev(h2, t0);
				append_dev(h2, t1);
				insert_dev(target, t2, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, t3, anchor);
				insert_dev(target, form, anchor);
				append_dev(form, input0);
				set_input_value(input0, /*title*/ ctx[0]);
				append_dev(form, t4);
				append_dev(form, textarea);
				set_input_value(textarea, /*description*/ ctx[1]);
				append_dev(form, t5);
				append_dev(form, input1);
				set_input_value(input1, /*start_time*/ ctx[2]);
				append_dev(form, t6);
				append_dev(form, input2);
				set_input_value(input2, /*end_time*/ ctx[3]);
				append_dev(form, t7);
				append_dev(form, button);

				if (!mounted) {
					dispose = [
						listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
						listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[9]),
						listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
						listen_dev(input2, "input", /*input2_input_handler*/ ctx[11]),
						listen_dev(form, "submit", prevent_default(/*saveEvent*/ ctx[6]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*isEditing*/ 32 && t0_value !== (t0_value = (/*isEditing*/ ctx[5] ? 'Edit' : 'New') + "")) set_data_dev(t0, t0_value);

				if (/*error*/ ctx[4]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block(ctx);
						if_block.c();
						if_block.m(t3.parentNode, t3);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (dirty & /*title*/ 1 && input0.value !== /*title*/ ctx[0]) {
					set_input_value(input0, /*title*/ ctx[0]);
				}

				if (dirty & /*description*/ 2) {
					set_input_value(textarea, /*description*/ ctx[1]);
				}

				if (dirty & /*start_time*/ 4) {
					set_input_value(input1, /*start_time*/ ctx[2]);
				}

				if (dirty & /*end_time*/ 8) {
					set_input_value(input2, /*end_time*/ ctx[3]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h2);
					detach_dev(t2);
					detach_dev(t3);
					detach_dev(form);
				}

				if (if_block) if_block.d(detaching);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$1($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Event', slots, []);
		let { id } = $$props;
		let title = '';
		let description = '';
		let start_time = '';
		let end_time = '';
		let error = '';
		let isEditing = false;

		const saveEvent = async () => {
			try {
				const method = isEditing ? 'PUT' : 'POST';
				const url = isEditing ? `/api/events/${id}` : '/api/events';

				const response = await fetch(url, {
					method,
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${localStorage.getItem('token')}`
					},
					body: JSON.stringify({ title, description, start_time, end_time })
				});

				const data = await response.json();

				if (response.ok) {
					navigate('/calendar');
				} else {
					$$invalidate(4, error = data.msg);
				}
			} catch(err) {
				$$invalidate(4, error = 'An error occurred');
			}
		};

		$$self.$$.on_mount.push(function () {
			if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
				console.warn("<Event> was created without expected prop 'id'");
			}
		});

		const writable_props = ['id'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Event> was created with unknown prop '${key}'`);
		});

		function input0_input_handler() {
			title = this.value;
			$$invalidate(0, title);
		}

		function textarea_input_handler() {
			description = this.value;
			$$invalidate(1, description);
		}

		function input1_input_handler() {
			start_time = this.value;
			$$invalidate(2, start_time);
		}

		function input2_input_handler() {
			end_time = this.value;
			$$invalidate(3, end_time);
		}

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(7, id = $$props.id);
		};

		$$self.$capture_state = () => ({
			onMount,
			navigate,
			id,
			title,
			description,
			start_time,
			end_time,
			error,
			isEditing,
			saveEvent
		});

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(7, id = $$props.id);
			if ('title' in $$props) $$invalidate(0, title = $$props.title);
			if ('description' in $$props) $$invalidate(1, description = $$props.description);
			if ('start_time' in $$props) $$invalidate(2, start_time = $$props.start_time);
			if ('end_time' in $$props) $$invalidate(3, end_time = $$props.end_time);
			if ('error' in $$props) $$invalidate(4, error = $$props.error);
			if ('isEditing' in $$props) $$invalidate(5, isEditing = $$props.isEditing);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			title,
			description,
			start_time,
			end_time,
			error,
			isEditing,
			saveEvent,
			id,
			input0_input_handler,
			textarea_input_handler,
			input1_input_handler,
			input2_input_handler
		];
	}

	class Event extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$1, create_fragment$1, safe_not_equal, { id: 7 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Event",
				options,
				id: create_fragment$1.name
			});
		}

		get id() {
			throw new Error("<Event>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error("<Event>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/App.svelte generated by Svelte v4.2.19 */

	// (14:2) <Route path="/">
	function create_default_slot_5(ctx) {
		let home;
		let current;
		home = new Home({ $$inline: true });

		const block = {
			c: function create() {
				create_component(home.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(home, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(home.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(home.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(home, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_5.name,
			type: "slot",
			source: "(14:2) <Route path=\\\"/\\\">",
			ctx
		});

		return block;
	}

	// (17:2) <Route path="/login">
	function create_default_slot_4(ctx) {
		let login;
		let current;
		login = new Login({ $$inline: true });

		const block = {
			c: function create() {
				create_component(login.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(login, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(login.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(login.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(login, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_4.name,
			type: "slot",
			source: "(17:2) <Route path=\\\"/login\\\">",
			ctx
		});

		return block;
	}

	// (20:2) <Route path="/register">
	function create_default_slot_3(ctx) {
		let register;
		let current;
		register = new Register({ $$inline: true });

		const block = {
			c: function create() {
				create_component(register.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(register, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(register.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(register.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(register, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_3.name,
			type: "slot",
			source: "(20:2) <Route path=\\\"/register\\\">",
			ctx
		});

		return block;
	}

	// (23:2) <Route path="/calendar">
	function create_default_slot_2(ctx) {
		let calendar;
		let current;
		calendar = new Calendar({ $$inline: true });

		const block = {
			c: function create() {
				create_component(calendar.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(calendar, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(calendar.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(calendar.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(calendar, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_2.name,
			type: "slot",
			source: "(23:2) <Route path=\\\"/calendar\\\">",
			ctx
		});

		return block;
	}

	// (26:2) <Route path="/event/:id" let:params>
	function create_default_slot_1(ctx) {
		let event;
		let current;

		event = new Event({
				props: { id: /*params*/ ctx[0].id },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(event.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(event, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const event_changes = {};
				if (dirty & /*params*/ 1) event_changes.id = /*params*/ ctx[0].id;
				event.$set(event_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(event.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(event.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(event, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1.name,
			type: "slot",
			source: "(26:2) <Route path=\\\"/event/:id\\\" let:params>",
			ctx
		});

		return block;
	}

	// (13:0) <Router>
	function create_default_slot(ctx) {
		let route0;
		let t0;
		let route1;
		let t1;
		let route2;
		let t2;
		let route3;
		let t3;
		let route4;
		let current;

		route0 = new Route({
				props: {
					path: "/",
					$$slots: { default: [create_default_slot_5] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		route1 = new Route({
				props: {
					path: "/login",
					$$slots: { default: [create_default_slot_4] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		route2 = new Route({
				props: {
					path: "/register",
					$$slots: { default: [create_default_slot_3] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		route3 = new Route({
				props: {
					path: "/calendar",
					$$slots: { default: [create_default_slot_2] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		route4 = new Route({
				props: {
					path: "/event/:id",
					$$slots: {
						default: [
							create_default_slot_1,
							({ params }) => ({ 0: params }),
							({ params }) => params ? 1 : 0
						]
					},
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(route0.$$.fragment);
				t0 = space();
				create_component(route1.$$.fragment);
				t1 = space();
				create_component(route2.$$.fragment);
				t2 = space();
				create_component(route3.$$.fragment);
				t3 = space();
				create_component(route4.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(route0, target, anchor);
				insert_dev(target, t0, anchor);
				mount_component(route1, target, anchor);
				insert_dev(target, t1, anchor);
				mount_component(route2, target, anchor);
				insert_dev(target, t2, anchor);
				mount_component(route3, target, anchor);
				insert_dev(target, t3, anchor);
				mount_component(route4, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const route0_changes = {};

				if (dirty & /*$$scope*/ 2) {
					route0_changes.$$scope = { dirty, ctx };
				}

				route0.$set(route0_changes);
				const route1_changes = {};

				if (dirty & /*$$scope*/ 2) {
					route1_changes.$$scope = { dirty, ctx };
				}

				route1.$set(route1_changes);
				const route2_changes = {};

				if (dirty & /*$$scope*/ 2) {
					route2_changes.$$scope = { dirty, ctx };
				}

				route2.$set(route2_changes);
				const route3_changes = {};

				if (dirty & /*$$scope*/ 2) {
					route3_changes.$$scope = { dirty, ctx };
				}

				route3.$set(route3_changes);
				const route4_changes = {};

				if (dirty & /*$$scope, params*/ 3) {
					route4_changes.$$scope = { dirty, ctx };
				}

				route4.$set(route4_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(route0.$$.fragment, local);
				transition_in(route1.$$.fragment, local);
				transition_in(route2.$$.fragment, local);
				transition_in(route3.$$.fragment, local);
				transition_in(route4.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(route0.$$.fragment, local);
				transition_out(route1.$$.fragment, local);
				transition_out(route2.$$.fragment, local);
				transition_out(route3.$$.fragment, local);
				transition_out(route4.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t0);
					detach_dev(t1);
					detach_dev(t2);
					detach_dev(t3);
				}

				destroy_component(route0, detaching);
				destroy_component(route1, detaching);
				destroy_component(route2, detaching);
				destroy_component(route3, detaching);
				destroy_component(route4, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot.name,
			type: "slot",
			source: "(13:0) <Router>",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let nav;
		let t;
		let router;
		let current;
		nav = new Nav({ $$inline: true });

		router = new Router({
				props: {
					$$slots: { default: [create_default_slot] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(nav.$$.fragment);
				t = space();
				create_component(router.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(nav, target, anchor);
				insert_dev(target, t, anchor);
				mount_component(router, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const router_changes = {};

				if (dirty & /*$$scope*/ 2) {
					router_changes.$$scope = { dirty, ctx };
				}

				router.$set(router_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(nav.$$.fragment, local);
				transition_in(router.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(nav.$$.fragment, local);
				transition_out(router.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}

				destroy_component(nav, detaching);
				destroy_component(router, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Router,
			Route,
			Nav,
			Home,
			Login,
			Register,
			Calendar,
			Event
		});

		return [];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new App({
	  target: document.getElementById('app'),
	  // hydrate: true, // Remove or set to false if not using hydration
	});

	return app;

})();
//# sourceMappingURL=bundle.js.map
