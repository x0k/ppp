<script>
	import { getLocale, setLocale } from '$lib/paraglide/runtime';
</script>

<button
	class="btn"
	onclick={() => {
		setLocale(getLocale() === 'en' ? 'ru' : 'en');
	}}>Button</button
>
