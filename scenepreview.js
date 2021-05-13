class ScenePreview {

    static naviHoverTransition;

    static positionPreview() {
        const rootStyle = document.querySelector(':root').style;
        rootStyle.setProperty('--navithumbh', document.querySelector("#navigation").offsetHeight + 'px');
    }

    static prepareScenePreview(i, sceneTab, sceneId) {
        if (sceneId) {
            let sceneThumbUrl = game.scenes.get(sceneId).data.thumb;
            if (sceneThumbUrl) {
                new Image().src = sceneThumbUrl;
                ScenePreview.positionPreview();
                $(sceneTab).append(
                    `
                    <div class="hover_preview_container">
                    <img
                      id="hover_preview_${i}"
                      class="navi-preview"
                      src='${sceneThumbUrl}' alt="Scene Preview">
                    </div>
                    `
                );
                $(sceneTab).hover(
                    function () {
                        if (!$(sceneTab).hasClass('view')) {
                            $(`#hover_preview_${i}`).show();
                            clearTimeout(ScenePreview.naviHoverTransition);
                            if (game.modules.get('window-controls')?.active) {
                                const minimized = game.settings.get('window-controls', 'organizedMinimize');
                                if (['top', 'topBar'].includes(minimized)) {
                                    $("#minimized-bar")?.hide();
                                    $(".minimized").hide();
                                }
                            }
                        }
                    },
                    function () {
                        if (!$(sceneTab).hasClass('view')) {
                            $(`#hover_preview_${i}`).hide();
                            if (game.modules.get('window-controls')?.active) {
                                const minimized = game.settings.get('window-controls', 'organizedMinimize');
                                if (['top', 'topBar'].includes(minimized)) {
                                    ScenePreview.naviHoverTransition = setTimeout(function () {
                                        const minimizedApps = $(".minimized");
                                        if (minimizedApps.length > 0) {
                                            $("#minimized-bar")?.fadeIn('fast');
                                            minimizedApps.fadeIn('fast');
                                        }
                                    }, 500)
                                }
                            }
                        }
                    }
                );
            }
        }
    }
}

Hooks.on('renderSceneNavigation', async function() {

    switch (game.settings.get('scene-preview', 'sceneNavigationPreview')) {
        case 'hover': {
            if (game.user.isGM) {
                // Compatibility: Includes class type scene list for compatibility with Monks Scene Navigation
                let sceneTabs = $("#scene-list li,.scene-list li");
                const rootStyle = document.querySelector(':root').style;
                const minimalUiActive = game.modules.get('minimal-ui')?.active;
                if (game.modules.get('monks-scene-navigation')?.active) {
                    if (minimalUiActive && game.settings.get('minimal-ui', 'sceneNavigationSize') === 'small')
                        rootStyle.setProperty('--navithumbmarg', '15px');
                    else if (minimalUiActive && game.settings.get('minimal-ui', 'sceneNavigationSize') === 'standard')
                        rootStyle.setProperty('--navithumbmarg', '26px');
                    else
                        rootStyle.setProperty('--navithumbmarg', '32px');
                } else {
                    rootStyle.setProperty('--navithumbmarg', '10px');
                }
                sceneTabs.each(function (i, sceneTab) {
                    let sceneId = $(sceneTab).attr('data-scene-id');
                    ScenePreview.prepareScenePreview(i, sceneTab, sceneId);
                });
            }
            break;
        }
    }
});

Hooks.on('canvasPan', function() {
    ScenePreview.positionPreview();
});

Hooks.once('init', () => {

    game.settings.register('scene-preview', 'sceneNavigationPreview', {
        name: game.i18n.localize("ScenePreview.NavigationPreviewName"),
        hint: game.i18n.localize("ScenePreview.NavigationPreviewHint"),
        scope: 'world',
        config: true,
        type: String,
        choices: {
            "disabled": game.i18n.localize("ScenePreview.Disabled"),
            "hover": game.i18n.localize("ScenePreview.NavigationPreviewHover")
        },
        default: "hover",
        onChange: _ => {
            window.location.reload()
        }
    });

});

Hooks.once('ready', () => {

    const rootStyle = document.querySelector(':root').style;
    if (game.modules.get('minimal-ui')?.active) {
        rootStyle.setProperty('--spbordercolor', game.settings.get('minimal-ui', 'borderColor'));
        rootStyle.setProperty('--spshadowcolor', game.settings.get('minimal-ui', 'shadowColor'));
        rootStyle.setProperty('--spshadowstrength', game.settings.get('minimal-ui', 'shadowStrength') + 'px');
    } else {
        rootStyle.setProperty('--spbordercolor', '#ff640080');
    }

})