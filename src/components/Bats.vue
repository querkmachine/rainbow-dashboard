<template>
    <section class="bats">
        <iframe class="bats__video" width="560" height="315" src="https://www.youtube-nocookie.com/embed/OuW5jvSxRi8?controls=0&enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </section>
</template>

<script>
    export default {
        name: 'Bats',
        mounted() {
            // https://developers.google.com/youtube/iframe_api_reference
            let tag = document.createElement('script');
            tag.id = 'iframe-demo';
            tag.src = 'https://www.youtube.com/iframe_api';
            let firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }
</script>

<style scoped>
.bats {
    width: 100%;
    padding-top: 56.25%;
    position: relative;
}
.bats__video {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}
</style>