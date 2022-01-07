# [2.8.0](https://github.com/eXaminator/kanka-foundry/compare/2.7.2...2.8.0) (2022-01-07)


### Bug Fixes

* update handling of reference links to work in FVTT 9 and onwards ([6631836](https://github.com/eXaminator/kanka-foundry/commit/6631836b6bbb5c9d24120923889de705a7bd6648)), closes [#85](https://github.com/eXaminator/kanka-foundry/issues/85)


### Features

* display pinned organisations and organisation members ([2584d55](https://github.com/eXaminator/kanka-foundry/commit/2584d5557f2f327ea5ac227951c933ad83ead272))

## [2.7.2](https://github.com/eXaminator/kanka-foundry/compare/2.7.1...2.7.2) (2021-12-21)


### Bug Fixes

* update foundry version to support all foundry 9 versions ([1634229](https://github.com/eXaminator/kanka-foundry/commit/163422926c936c64a365d48edd2b113e63996368))

## [2.7.1](https://github.com/eXaminator/kanka-foundry/compare/2.7.0...2.7.1) (2021-12-21)


### Bug Fixes

* remove check for document sheet registrar dependency ([1bcd3a3](https://github.com/eXaminator/kanka-foundry/commit/1bcd3a33a1bc455153d69cfd358c5d7b3ab26b54))

# [2.7.0](https://github.com/eXaminator/kanka-foundry/compare/2.6.0...2.7.0) (2021-12-16)


### Bug Fixes

* improve tab styles to work as expected in foundry 9 ([58494a7](https://github.com/eXaminator/kanka-foundry/commit/58494a71c1c1962601c60056597afc160b60fb1b))
* remove unnecessary workaround for broken Kanka links ([b2daa5d](https://github.com/eXaminator/kanka-foundry/commit/b2daa5dc7f804a11edcc82d17bf99ab5ede6723d))


### Features

* move kanka button to journal list footer ([660968b](https://github.com/eXaminator/kanka-foundry/commit/660968b4f648783f3a33653e0a55dc7296ec1284))
* remove dependency to documentSheetRegistrar library ([472337d](https://github.com/eXaminator/kanka-foundry/commit/472337d02c2694ff4de127d6f7a56a7016b70c86))
* rename "Story" tab to "Overview" in accordance with recent changes in Kanka ([d79027d](https://github.com/eXaminator/kanka-foundry/commit/d79027d8ea72e93ed097c6c88def5f61038e533b))
* update minimum and maximum supported foundry version to 9 ([18a6827](https://github.com/eXaminator/kanka-foundry/commit/18a68272c1f25fa1d807da8a33a766d63c3cec87))

# [2.6.0](https://github.com/eXaminator/kanka-foundry/compare/2.5.0...2.6.0) (2021-10-20)


### Bug Fixes

* always display relations tab, even if all relations are pinned ([67d4a13](https://github.com/eXaminator/kanka-foundry/commit/67d4a13d7313f58cfbec131869968807bf6b76d4)), closes [#77](https://github.com/eXaminator/kanka-foundry/issues/77)
* use correct path for images when hosted with a route prefix (like http://somehost.com/foundry) ([19e9536](https://github.com/eXaminator/kanka-foundry/commit/19e953677d8aa882b7a82c059ed33e240142c61d)), closes [#78](https://github.com/eXaminator/kanka-foundry/issues/78)


### Features

* Correctly parse Foundry links like `@Actor[Name]` in entries, attributes etc. ([c29d077](https://github.com/eXaminator/kanka-foundry/commit/c29d07788da1c62e9764d2badb9b43f531806e41)), closes [#80](https://github.com/eXaminator/kanka-foundry/issues/80)
* show child entries for all supported entity types ([a112988](https://github.com/eXaminator/kanka-foundry/commit/a112988c2a34827cb603f8cbc2623c117256d591)), closes [#82](https://github.com/eXaminator/kanka-foundry/issues/82)

# [2.5.0](https://github.com/eXaminator/kanka-foundry/compare/2.4.0...2.5.0) (2021-09-11)


### Features

* add support for events ([debd7fd](https://github.com/eXaminator/kanka-foundry/commit/debd7fd5ba12ec1c066ba93d3a9da7e9e9ff882e))

# [2.4.0](https://github.com/eXaminator/kanka-foundry/compare/2.3.10...2.4.0) (2021-08-23)


### Bug Fixes

* activate JournalEntry settings for newest documentSheetRegistrar versions ([5d8d92d](https://github.com/eXaminator/kanka-foundry/commit/5d8d92d1c70304fc993bae68d954cc57f27e127a))
* don't switch to image mode when clicking the image of an entity in readonly mode ([3ecbd6a](https://github.com/eXaminator/kanka-foundry/commit/3ecbd6ad0617963a4e53c74aa51c9b79e82e0dba))
* ensure document-sheet-registrar is active on ready ([1096a4d](https://github.com/eXaminator/kanka-foundry/commit/1096a4deed3fe128aefb77568a644f6c8ee268ae))
* fix grid view in entity browser ([db5b7e1](https://github.com/eXaminator/kanka-foundry/commit/db5b7e16b13c85c4419ed526389ef75e67812a3a))
* remove extra padding outside of the main document sheet ([fef7f5e](https://github.com/eXaminator/kanka-foundry/commit/fef7f5e3bcd67a6477b4e867b586029f2b4ebecd))
* switch from ready to documentSheetRegistrarInit hook ([5e0a496](https://github.com/eXaminator/kanka-foundry/commit/5e0a49600ff70e0f662dc630b3285c12f91367ff))
* update supported foundry version to 0.8.9 ([0b73999](https://github.com/eXaminator/kanka-foundry/commit/0b73999ac0c25815c0a08e5fb7b3ad95014a9cc7))


### Features

* add setting to sync permissions of an entry on every sync ([7a6f805](https://github.com/eXaminator/kanka-foundry/commit/7a6f8054dce1c6e422b0d264f30f4db0dc7e4cf2)), closes [#69](https://github.com/eXaminator/kanka-foundry/issues/69)

## [2.3.10](https://github.com/eXaminator/kanka-foundry/compare/2.3.9...2.3.10) (2021-08-10)


### Bug Fixes

* correctly sort attributes the way they are in Kanka ([ff7f0c6](https://github.com/eXaminator/kanka-foundry/commit/ff7f0c68f2caae85cfded96acc83fff4b43eb980))

## [2.3.9](https://github.com/eXaminator/kanka-foundry/compare/2.3.8...2.3.9) (2021-08-08)


### Bug Fixes

* correctly handle empty attributes with empty type ([2cd1d93](https://github.com/eXaminator/kanka-foundry/commit/2cd1d933f0a9c0aa792e1515c2aa4ec13ae13608)), closes [#72](https://github.com/eXaminator/kanka-foundry/issues/72)
* register sheet on ready to make sure the sheet registrar module was loaded ([ab57710](https://github.com/eXaminator/kanka-foundry/commit/ab577104c64a1eda3f07ea4cae4aae93b014dd5d))

## [2.3.8](https://github.com/eXaminator/kanka-foundry/compare/2.3.7...2.3.8) (2021-08-08)


### Bug Fixes

* use correct template when switching journal entry to image mode ([30c275c](https://github.com/eXaminator/kanka-foundry/commit/30c275cb6de053c3749f4035ffd34b876392eb5b)), closes [#71](https://github.com/eXaminator/kanka-foundry/issues/71)

## [2.3.7](https://github.com/eXaminator/kanka-foundry/compare/2.3.6...2.3.7) (2021-08-04)


### Bug Fixes

* set correct root classes for journal applications ([50f4e03](https://github.com/eXaminator/kanka-foundry/commit/50f4e03c5087aca5ec159833c0cec2894bb9fe31))

## [2.3.6](https://github.com/eXaminator/kanka-foundry/compare/2.3.5...2.3.6) (2021-08-02)


### Bug Fixes

* add dialog to inform the user if the sheet registrar module is not activated ([ca9bd92](https://github.com/eXaminator/kanka-foundry/commit/ca9bd92e6c5e110800e91d428d2824879c75cafc))

## [2.3.5](https://github.com/eXaminator/kanka-foundry/compare/2.3.4...2.3.5) (2021-08-02)


### Bug Fixes

* exchange shim with dependency to _document-sheet-registrar ([b99db12](https://github.com/eXaminator/kanka-foundry/commit/b99db124bb9ae98244fd57aa4c9d6e8475dfce3f)), closes [#67](https://github.com/eXaminator/kanka-foundry/issues/67)

## [2.3.4](https://github.com/eXaminator/kanka-foundry/compare/2.3.3...2.3.4) (2021-07-25)


### Bug Fixes

* display quest completion icon for players, not just GM ([4b5ad6d](https://github.com/eXaminator/kanka-foundry/commit/4b5ad6de6711d0e5859221c668e412fa5a72d846))

## [2.3.3](https://github.com/eXaminator/kanka-foundry/compare/2.3.2...2.3.3) (2021-07-25)


### Bug Fixes

* fix quest completion icon to not intefere with permission viewer ([ecf324e](https://github.com/eXaminator/kanka-foundry/commit/ecf324ee6fd9a428fe48a53f82af8c854b918339))

## [2.3.2](https://github.com/eXaminator/kanka-foundry/compare/2.3.1...2.3.2) (2021-07-25)


### Bug Fixes

* make css classes for specific to prevent style interference from other systems / modules ([63135f8](https://github.com/eXaminator/kanka-foundry/commit/63135f8437ace11eb52f1c2c59e90b0f34e2c16b))
* register sheet class earlier in initialization to prevent them from not being loaded ([c9e72a6](https://github.com/eXaminator/kanka-foundry/commit/c9e72a6f70a1ef0ab159ac84453e111477265dfe))
* take settings for private and template entities into account when using "link all" ([0655b37](https://github.com/eXaminator/kanka-foundry/commit/0655b37bd28be8f7d53278f211f0cba5b58b655f))
* use correct method to bring kanka window into focus ([13cfd42](https://github.com/eXaminator/kanka-foundry/commit/13cfd425d747c4c80f3e9aff8c205c42da7ff9a9))

## [2.3.1](https://github.com/eXaminator/kanka-foundry/compare/2.3.0...2.3.1) (2021-07-17)


### Bug Fixes

* fix code minification so that the correct sheet class will be selected for kanka entries ([229697e](https://github.com/eXaminator/kanka-foundry/commit/229697ed6b1f15a2f6cb05150ec118925f41d290))

# [2.3.0](https://github.com/eXaminator/kanka-foundry/compare/2.2.3...2.3.0) (2021-07-17)


### Bug Fixes

* change default settings for folder tree and image in text ([ace1868](https://github.com/eXaminator/kanka-foundry/commit/ace186848ecf484968e6491dd1dd2319d9a68bb8))


### Features

* add option to add an icon to quest names in the sidebar to show their completion status ([d28e792](https://github.com/eXaminator/kanka-foundry/commit/d28e792255a1a50e5657fa873df0f1b4f19784ca))
* add shim for journal sheet registration to improve compatibility with other modules and systems ([8760add](https://github.com/eXaminator/kanka-foundry/commit/8760addc1243ce9683f2853b5083b24f270690a3))

## [2.2.3](https://github.com/eXaminator/kanka-foundry/compare/2.2.2...2.2.3) (2021-07-05)


### Bug Fixes

* fix version replacement in semantic-release config ([c34846e](https://github.com/eXaminator/kanka-foundry/commit/c34846ec693a1a3b8c6e14608314e32d0b8b838a))

## [2.2.2](https://github.com/eXaminator/kanka-foundry/compare/2.2.1...2.2.2) (2021-07-05)


### Bug Fixes

* fix hover styles of images when displayed in GM Screen ([15f9146](https://github.com/eXaminator/kanka-foundry/commit/15f9146b5dbb9a495988a9205e49a7723bf39b57))

## [2.2.1](https://github.com/eXaminator/kanka-foundry/compare/2.2.0...2.2.1) (2021-07-03)


### Bug Fixes

* improve asset tab styling when few files were added to an entity ([8a9faae](https://github.com/eXaminator/kanka-foundry/commit/8a9faaebc0b057b82feed32a35e391f9254c80ba))
* keep styles and options of non-kanka journal entries intact ([1deb4cb](https://github.com/eXaminator/kanka-foundry/commit/1deb4cb46975a93780069becd942102e6a123926))
* streamline button styles across all kanka windows ([ba222db](https://github.com/eXaminator/kanka-foundry/commit/ba222db1a38dfdce5a6b226ffd2573319a56cb8e))

# [2.2.0](https://github.com/eXaminator/kanka-foundry/compare/2.1.1...2.2.0) (2021-06-26)


### Features

* add list of entities that have been deleted in kanka but exist in foundry ([6018241](https://github.com/eXaminator/kanka-foundry/commit/601824182ed8ad90cbfdf0e6ecec57201c1b34fc)), closes [#47](https://github.com/eXaminator/kanka-foundry/issues/47)
* add official 0.8.8 support ([d6160cd](https://github.com/eXaminator/kanka-foundry/commit/d6160cd1f044144b051c7cb32d269f387ba500dd))
* hide entities that are marked as template by default ([7c99f52](https://github.com/eXaminator/kanka-foundry/commit/7c99f52f5b96669ccc4c8250411cabd6c10a806e))
* improve asset gallery view ([8b86f8b](https://github.com/eXaminator/kanka-foundry/commit/8b86f8b589affe67d3a18a05ca8af6658263cc00))
* move all notes to the first tab to mirror Kankas new behavior ([48a9203](https://github.com/eXaminator/kanka-foundry/commit/48a920393370489ac1b504ec9f051a3d516f7396))
* rename tabs to fall in line with recent Kanka update ([9a20ebe](https://github.com/eXaminator/kanka-foundry/commit/9a20ebe173fa6b2ba227c45b9a2561bcdf3e8515))

## [2.1.1](https://github.com/eXaminator/kanka-foundry/compare/2.1.0...2.1.1) (2021-06-17)


### Bug Fixes

* remove duplicate ancestor detail row for races ([0c61253](https://github.com/eXaminator/kanka-foundry/commit/0c612536d1f48f5c3d1dc476d31d7e762287699b))

# [2.1.0](https://github.com/eXaminator/kanka-foundry/compare/2.0.1...2.1.0) (2021-06-15)


### Bug Fixes

* improve rendering in readonly context ([43d2496](https://github.com/eXaminator/kanka-foundry/commit/43d2496ffbe26aa41c801827ca8a61bdc250bd2d))


### Features

* add button to link all entities at once ([491827f](https://github.com/eXaminator/kanka-foundry/commit/491827f8640bc68f55122ca657590371cc950bf8)), closes [#46](https://github.com/eXaminator/kanka-foundry/issues/46)
* add option to automatically set observer permissions for all players on public entities ([4d725f4](https://github.com/eXaminator/kanka-foundry/commit/4d725f4d30b41e1ea392fdd5f943ee6f2d593b5b)), closes [#49](https://github.com/eXaminator/kanka-foundry/issues/49)
* add progress bar for bulk operations ([505a3da](https://github.com/eXaminator/kanka-foundry/commit/505a3da944df52323f3c9bcaec536a5d9035b2e3))
* add support for Foundry 0.8.7 ([b733d3c](https://github.com/eXaminator/kanka-foundry/commit/b733d3c23168e5693164066e35f5757512042d39))
* add tab that displays all files of an entity ([8cdde61](https://github.com/eXaminator/kanka-foundry/commit/8cdde61124023961a9731d062c049085f405f3ea)), closes [#2](https://github.com/eXaminator/kanka-foundry/issues/2)
* remove Foundry 0.7.x support ([d2c2879](https://github.com/eXaminator/kanka-foundry/commit/d2c287986ab31f4aab52163bd1866729a7cc411b))
* show specific list of journal entries and folders that will be migrated on module update ([2b4700e](https://github.com/eXaminator/kanka-foundry/commit/2b4700e012d7a5305b85bc19993b7a3340103570))
* switch to image mode when clicking the image in the entry ([e5ab565](https://github.com/eXaminator/kanka-foundry/commit/e5ab56534ffe48f97ac6fd6edd608ff935d96d6e))

## [2.0.1](https://github.com/eXaminator/kanka-foundry/compare/2.0.0...2.0.1) (2021-06-11)


### Bug Fixes

* correctly get ancestors when importing individual races ([8122da1](https://github.com/eXaminator/kanka-foundry/commit/8122da1183eadced672d60aa007f3935d772d103)), closes [#45](https://github.com/eXaminator/kanka-foundry/issues/45)

# [2.0.0](https://github.com/eXaminator/kanka-foundry/compare/1.9.7...2.0.0) (2021-05-29)

This is a big update!

Please make a backup of your Journal Entries before updating, just to be sure!

In this release I have rewritten almost everything about this module. Instead of just writing a Journal Entry with some formatted HTML in it, it will actually save a full snapshot of the Kanka entity and display it using a fully customized template. This allows for a cleaner and elaborated user interface and also opens the door for some future improvements that weren't possible before.

## Breaking Changes
* Previously imported Journal Entries are not compatible with this version, but the module will prompt you to update old entries and offers you a way to do so. Please back up you world data before doing this if you don't want to risk having to reimport and reorganize data by hand.

## Features

### General
* Add support for Foundry 0.8 (but it is still compatible with 0.7)
* Improve error handling in most places

### Browser
* Add a gridded view to the Kanka Entity Browser
* Improve the display for entities that are outdated
* Add button to easily update all outdated entries

### Journal Entries
* Enhance Journal Entries by using custom templates that use a tabbed layout to display all the information Kanka has to offer. This is a complete overhaul of how theses Journal Entries look and behave. Take a look at the README to see what this looks like.
* Improve permission handling by actually displaying different data to Foundry users depending on their permissions of each Journal Entry.
* Show which information are secret and will thusly not be displayed for non-owners of that Journal Entry.
* Add button to each Journal Entry to update that entity directly from there (Beware: This uses up more API requests than doing it via the Entity Browser. So only use this for individual updates, not to update multiple entities in a short time See API Limits in the readme).

## [1.9.7](https://github.com/eXaminator/kanka-foundry/compare/1.9.6...1.9.7) (2021-03-27)


### Bug Fixes

* remove links to journal entries they player has no permission to see ([6d19f3b](https://github.com/eXaminator/kanka-foundry/commit/6d19f3b30963ddf8256be8adc8a575f592533f18))

## [1.9.6](https://github.com/eXaminator/kanka-foundry/compare/1.9.5...1.9.6) (2021-03-27)


### Bug Fixes

* prevent unnecessary requests for empty quest relations ([47b0b85](https://github.com/eXaminator/kanka-foundry/commit/47b0b85051687a609f7d5af4982f2900ccfc4248))
* refresh entities sequential because parallel handling caused caching issues on quests ([072939a](https://github.com/eXaminator/kanka-foundry/commit/072939a47ca69f5079df5342a7813ea0387bbd69))

## [1.9.5](https://github.com/eXaminator/kanka-foundry/compare/1.9.4...1.9.5) (2021-03-21)


### Bug Fixes

* create each journal entry individually to prevent the creation of multiple folders ([650de0e](https://github.com/eXaminator/kanka-foundry/commit/650de0e99109a934a19c4eb33be069c82d789b9a))

## [1.9.4](https://github.com/eXaminator/kanka-foundry/compare/1.9.3...1.9.4) (2021-02-18)


### Bug Fixes

* **module.json:** add module fields for simplified bug tracking ([ad676b6](https://github.com/eXaminator/kanka-foundry/commit/ad676b6501e75143441369cabd3084c78dd14292))

## [1.9.3](https://github.com/eXaminator/kanka-foundry/compare/1.9.2...1.9.3) (2021-02-18)


### Bug Fixes

* add additional manifest fields to improve module discovery on foundryvtt hub ([ed775c6](https://github.com/eXaminator/kanka-foundry/commit/ed775c65470d1f0344431ac104710f5585772b20))

## [1.9.2](https://github.com/eXaminator/kanka-foundry/compare/1.9.1...1.9.2) (2021-01-27)


### Bug Fixes

* ignore entity references in meta data if they can't be resolved ([98822ca](https://github.com/eXaminator/kanka-foundry/commit/98822cadbc2ac1b92dfcde1fc942d2d87178def2)), closes [#39](https://github.com/eXaminator/kanka-foundry/issues/39)
* improve handling of unexpected errors while syncing entities ([ef7a4c4](https://github.com/eXaminator/kanka-foundry/commit/ef7a4c4efa02a8221a51b79e8bfdd050dc1ff232))

## [1.9.1](https://github.com/eXaminator/kanka-foundry/compare/1.9.0...1.9.1) (2021-01-10)


### Bug Fixes

* fix settings to remove unnecessary checkboxes ([25498ac](https://github.com/eXaminator/kanka-foundry/commit/25498ac8386b0be84b15c77b96c90048da2e8210))

# [1.9.0](https://github.com/eXaminator/kanka-foundry/compare/1.8.1...1.9.0) (2021-01-08)


### Bug Fixes

* preload templates to slightly improve performance ([25c1f26](https://github.com/eXaminator/kanka-foundry/commit/25c1f26a9c38e0e4744238d9e2c5fead24e3fd85))


### Features

* add loading indicator while syncing entries ([5bf0ffb](https://github.com/eXaminator/kanka-foundry/commit/5bf0ffbc820868dc2cb38db871bf923f6b4fb8db))
* import organisation membership for characters ([45fae70](https://github.com/eXaminator/kanka-foundry/commit/45fae706e685db86d87cf97b10cdafcc4287bd5a))
* import relations as metadata and improve styling of metadata ([bc8ff9d](https://github.com/eXaminator/kanka-foundry/commit/bc8ff9df95a1715b26efb246f0b98f137380b414))

## [1.8.1](https://github.com/eXaminator/kanka-foundry/compare/1.8.0...1.8.1) (2021-01-03)


### Bug Fixes

* fix kanka hook registration which was broken in last release ([275d4a2](https://github.com/eXaminator/kanka-foundry/commit/275d4a25259a4dcbf0cfe7aa785d039a79778db6))

# [1.8.0](https://github.com/eXaminator/kanka-foundry/compare/1.7.0...1.8.0) (2021-01-03)


### Bug Fixes

* remember current filter when refreshing application sheet ([7de4d84](https://github.com/eXaminator/kanka-foundry/commit/7de4d84eb71105f10923fa53ad107c62ae898f52))
* remove refresh on every journal directory change ([cca312e](https://github.com/eXaminator/kanka-foundry/commit/cca312e5806d30af5209373f4af9989f66ddcb1c))


### Features

* add option to set the import language ([73252fa](https://github.com/eXaminator/kanka-foundry/commit/73252fa0566ddfca5c8dd22d5de1ea0092dd0fac))

# [1.7.0](https://github.com/eXaminator/kanka-foundry/compare/1.6.2...1.7.0) (2021-01-01)


### Bug Fixes

* add journal icon to mention links to match the look of regular journal links ([2d09b67](https://github.com/eXaminator/kanka-foundry/commit/2d09b67ed903ec7aac28f31119c8fa21fb0c40f0))


### Features

* add button to refresh all linked entries ([c86b15c](https://github.com/eXaminator/kanka-foundry/commit/c86b15c14350c3432cf3472e6a9b1f33b2896961))
* add setting to remove mention links to kanka for non-imported entities ([43ce785](https://github.com/eXaminator/kanka-foundry/commit/43ce785117cf8c797be7ac61ad31db6e2b3962c1))
* improve metadata table layout and linking to referenced entities ([de0a4da](https://github.com/eXaminator/kanka-foundry/commit/de0a4da262ee9056fd6537e2fa78683e672e8392))

## [1.6.2](https://github.com/eXaminator/kanka-foundry/compare/1.6.1...1.6.2) (2020-12-31)


### Bug Fixes

* use parsed content of entity notes to keep mentions intact ([fb26446](https://github.com/eXaminator/kanka-foundry/commit/fb2644609c2cc8b116afdcb63ce7152b727bda81))

## [1.6.1](https://github.com/eXaminator/kanka-foundry/compare/1.6.0...1.6.1) (2020-12-30)


### Bug Fixes

* leverage foundrys own linking mechanism between journal entries to ensure permissions are handled ([f30cbc0](https://github.com/eXaminator/kanka-foundry/commit/f30cbc0126fad5dacf799730eedbd63b76c68bfd))

# [1.6.0](https://github.com/eXaminator/kanka-foundry/compare/1.5.3...1.6.0) (2020-12-29)


### Bug Fixes

* ensure that main kanka images always get their max-width ([4c2c8cb](https://github.com/eXaminator/kanka-foundry/commit/4c2c8cbc7b5b6c60232423f801c5b99f6980f44b))


### Features

* add filter to browse window to make it easier to find entities ([ed615d7](https://github.com/eXaminator/kanka-foundry/commit/ed615d7bc4b7ba132ea8049e82320513c5a2576b))
* optionally add entity notes as paragraphs or secrets to journal entries ([33e80a8](https://github.com/eXaminator/kanka-foundry/commit/33e80a819611c927e8b849d38ef41c3f50630c9d))

## [1.5.3](https://github.com/eXaminator/kanka-foundry/compare/1.5.2...1.5.3) (2020-12-29)


### Bug Fixes

* correctly load all pages on paginated Kanka API lists ([8f3e923](https://github.com/eXaminator/kanka-foundry/commit/8f3e923122a13eadf202240c54ca7bfb31b5cd4f))

## [1.5.2](https://github.com/eXaminator/kanka-foundry/compare/1.5.1...1.5.2) (2020-12-27)


### Bug Fixes

* update supported foundry version to 0.7.9 ([adccf0e](https://github.com/eXaminator/kanka-foundry/commit/adccf0eeb72994a7f96a5907b386d979778b8621))

## [1.5.1](https://github.com/eXaminator/kanka-foundry/compare/1.5.0...1.5.1) (2020-12-19)


### Bug Fixes

* improve best guess for the correct locale when generating links to kanka ([956a2ec](https://github.com/eXaminator/kanka-foundry/commit/956a2ec21f097db5e5ba06c349e0724dbac85f5a)), closes [#27](https://github.com/eXaminator/kanka-foundry/issues/27)

# [1.5.0](https://github.com/eXaminator/kanka-foundry/compare/1.4.1...1.5.0) (2020-12-12)


### Bug Fixes

* ensure that missing tags are updated when refreshing an entity ([d8a7a48](https://github.com/eXaminator/kanka-foundry/commit/d8a7a48e2a7c68083145f4f9e9485683f7e4831f))


### Features

* add link to the correspending kanka page of an entity in every journal entries window header ([0441e1e](https://github.com/eXaminator/kanka-foundry/commit/0441e1ee3e974bd8ae53e785d0b8b6373cf82b95))

## [1.4.1](https://github.com/eXaminator/kanka-foundry/compare/1.4.0...1.4.1) (2020-12-05)


### Bug Fixes

* add support for FoundryVTT 0.7.8 ([0f14521](https://github.com/eXaminator/kanka-foundry/commit/0f14521d7d7b94667bbbc917e6f533cb9fe361ec))

# [1.4.0](https://github.com/eXaminator/kanka-foundry/compare/1.3.0...1.4.0) (2020-11-30)


### Bug Fixes

* show the correct name in link button ([fd2d4ad](https://github.com/eXaminator/kanka-foundry/commit/fd2d4ad1a817339fc1b5614667cb9a5c0f3eea73))


### Features

* **api:** increase number of requests for Kanka subscribers ([d1fab2f](https://github.com/eXaminator/kanka-foundry/commit/d1fab2f7a5b392bad0c3661804d7a0b60985412c)), closes [#20](https://github.com/eXaminator/kanka-foundry/issues/20)
* add more spacing to buttons in kanka browser ([d4d5b2c](https://github.com/eXaminator/kanka-foundry/commit/d4d5b2cd1e47b75701a37ed19ba2a1945ced168f))
* display thumbnail for every entry in kanka browser ([b2d329d](https://github.com/eXaminator/kanka-foundry/commit/b2d329d6cf5a4fcfe0596c05480a3c9f54464fb2))
* show in kanka browser if an entry is outdated ([9640ccb](https://github.com/eXaminator/kanka-foundry/commit/9640ccbc6986771e57045f1498256720c976255c))

# [1.3.0](https://github.com/eXaminator/kanka-foundry/compare/1.2.0...1.3.0) (2020-11-26)


### Bug Fixes

* remove image URL workaround ([a695ddd](https://github.com/eXaminator/kanka-foundry/commit/a695dddb051f82a127020291b9aacc2c0504674a))
* use english das default locale for mention links ([1ac786b](https://github.com/eXaminator/kanka-foundry/commit/1ac786b0ecc71c334fa4bc8c008d29f630d4a5f0))
* **journal:** fix inventory representation in metadata ([59ad107](https://github.com/eXaminator/kanka-foundry/commit/59ad1079e120e5cb5914ebd322f43012618534cd))
* **translation:** add missing translation for successful entity link notfication ([dccdaca](https://github.com/eXaminator/kanka-foundry/commit/dccdaca6b90c881be08e5fb1435c9c14b29d6837))


### Features

* **journal:** add quest organisations and items to metadata ([0a37e1d](https://github.com/eXaminator/kanka-foundry/commit/0a37e1dc3cec48ad9428e51d3298a99e777d1cb3))
* **journal:** add setting to create folders based on kanka tree structure ([56ab02c](https://github.com/eXaminator/kanka-foundry/commit/56ab02c3a24340997b53c4130d66fa1dee327839)), closes [#22](https://github.com/eXaminator/kanka-foundry/issues/22)

# [1.2.0](https://github.com/eXaminator/kanka-foundry/compare/1.1.1...1.2.0) (2020-11-23)


### Bug Fixes

* **metadata:** fix order of attributes to match those in Kanka ([faa2a06](https://github.com/eXaminator/kanka-foundry/commit/faa2a06a9d2a3d941a8d88b697c9ec44c40dd2d0))
* **ui:** improve element list readability ([62f88d0](https://github.com/eXaminator/kanka-foundry/commit/62f88d00fe727324d1c19e7056f1473ef4bdf5b8))


### Features

* **metadata:** add location, race, family and other references to metadata ([db85a51](https://github.com/eXaminator/kanka-foundry/commit/db85a51b33bb2eed675359794cd77fa1ecd2c735)), closes [#12](https://github.com/eXaminator/kanka-foundry/issues/12)
* **metadata:** show inventory in metadata on all supported entities ([f10576b](https://github.com/eXaminator/kanka-foundry/commit/f10576b5b52a350123bd7d8fdc5927b922f5fbf6))

## [1.1.1](https://github.com/eXaminator/kanka-foundry/compare/1.1.0...1.1.1) (2020-11-21)


### Bug Fixes

* use original sized image from Kanka ([a60e7ad](https://github.com/eXaminator/kanka-foundry/commit/a60e7ad209d7ee9b001397cc6b7fa25c09ec74ca)), closes [#11](https://github.com/eXaminator/kanka-foundry/issues/11)

# [1.1.0](https://github.com/eXaminator/kanka-foundry/compare/1.0.3...1.1.0) (2020-11-21)


### Bug Fixes

* **translations:** change "meta data" to "metadata" ([ec7c142](https://github.com/eXaminator/kanka-foundry/commit/ec7c142952822bf5a8c69290a704bb41cfb39246))
* use correct translation for folder names ([e9a95a1](https://github.com/eXaminator/kanka-foundry/commit/e9a95a1f10ce5327f2568007ec50b7768c556af5))


### Features

* **translations:** add German translations ([a214986](https://github.com/eXaminator/kanka-foundry/commit/a2149865441186bc32757a29164050832d8d680c))

## [1.0.3](https://github.com/eXaminator/kanka-foundry/compare/1.0.2...1.0.3) (2020-11-21)


### Bug Fixes

* **api:** ensure that all requests are made with https instead of http ([efa9e8c](https://github.com/eXaminator/kanka-foundry/commit/efa9e8c2db3c131b4e700cd644591628133faca7))
* **settings:** improve handling for missing or invalid access token ([0e9e36f](https://github.com/eXaminator/kanka-foundry/commit/0e9e36f5aa4335354a8939b2f99596aa49ba6164))

## [1.0.2](https://github.com/eXaminator/kanka-foundry/compare/1.0.1...1.0.2) (2020-11-21)


### Bug Fixes

* **ci:** add updated manifest file to module package ([cdde292](https://github.com/eXaminator/kanka-foundry/commit/cdde2923503d356aac99504d96529a0ef7f6ede1))

## [1.0.2](https://github.com/eXaminator/kanka-foundry/compare/1.0.1...1.0.2) (2020-11-21)


### Bug Fixes

* **ci:** add updated manifest file to module package ([cdde292](https://github.com/eXaminator/kanka-foundry/commit/cdde2923503d356aac99504d96529a0ef7f6ede1))

## [1.0.1](https://github.com/eXaminator/kanka-foundry/compare/1.0.0...1.0.1) (2020-11-21)


### Bug Fixes

* **manifest:** update foundry manifest ([c1891fc](https://github.com/eXaminator/kanka-foundry/commit/c1891fcf7c3445e5aa6047cdc21fa11e945288c4)), closes [#5](https://github.com/eXaminator/kanka-foundry/issues/5) [#6](https://github.com/eXaminator/kanka-foundry/issues/6)

# 1.0.0 (2020-11-21)


### Bug Fixes

* add missing translation ([0c2b4ef](https://github.com/eXaminator/kanka-foundry/commit/0c2b4efd883ac010fb219c56eaf9b72816555e4f))
* change icons to be closer to kankas icons ([6d32c70](https://github.com/eXaminator/kanka-foundry/commit/6d32c70f0fc52dc124b2e57931dc07781ea9ec42))
* change quest entity type to correct value ([813cbdb](https://github.com/eXaminator/kanka-foundry/commit/813cbdb77a2ea970361579a9780088553422d92c))
* correctly convert campaign id to improve request caching ([69ab8fc](https://github.com/eXaminator/kanka-foundry/commit/69ab8fc6ef4dc899644def6c9179d490651313e0))
* fix workaround for broken kanka mention links ([98f1348](https://github.com/eXaminator/kanka-foundry/commit/98f1348abd519615353a8c9307d96adbba2896ca))
* improve error handling fo API requests ([7a35a6d](https://github.com/eXaminator/kanka-foundry/commit/7a35a6dbd1e6e16ac11fd0991c15ee8e0e5fa11a))
* improve link and sync logic ([32d1474](https://github.com/eXaminator/kanka-foundry/commit/32d147419dd9bb1fdb2b54c7a4ddbab52ee2fe5d))
* improve link generation for entities ending in "y" ([151a6cc](https://github.com/eXaminator/kanka-foundry/commit/151a6cc01bee02b3bae998c108ed02153ccaca11))
* improve style for details summary ([b97fb6a](https://github.com/eXaminator/kanka-foundry/commit/b97fb6a7a43616629621ea54a64231e95b4f64c6))
* open new journal entry sheet in read mode after sync ([c308267](https://github.com/eXaminator/kanka-foundry/commit/c308267a82bf2bbefe4f6eccb92f8d3bdf8593ed))
* organisation typing ([3cc8976](https://github.com/eXaminator/kanka-foundry/commit/3cc89765060a3277f0c3f9e2c5cc0abd78fcaafc))
* use correct key for entity links ([1ea09b3](https://github.com/eXaminator/kanka-foundry/commit/1ea09b3f927e9125009919d060684c5356d04115))


### Features

* add character traits as metadata ([8027315](https://github.com/eXaminator/kanka-foundry/commit/8027315a07fabe9179f60f0ae6b49c511a80ae83)), closes [#13](https://github.com/eXaminator/kanka-foundry/issues/13)
* add configuration option to include image in journal text ([6d2e9c3](https://github.com/eXaminator/kanka-foundry/commit/6d2e9c3a015f689cbf1622eccfda08063131a1ab))
* add configuration to decide how attributes should be handled ([36b20bb](https://github.com/eXaminator/kanka-foundry/commit/36b20bbeb08fa25b49fcecdadc7cd21fa6bc9159))
* add english translations ([8f2bf5b](https://github.com/eXaminator/kanka-foundry/commit/8f2bf5b459fedee504feda46ce142ee3e5a4ccfb))
* add extended meta data import configuration ([1ecfd99](https://github.com/eXaminator/kanka-foundry/commit/1ecfd99b66d784791139e08563a17761d604b4c5)), closes [#7](https://github.com/eXaminator/kanka-foundry/issues/7)
* add import for ability entities ([f80c63a](https://github.com/eXaminator/kanka-foundry/commit/f80c63afe376ca2a6f267b820177d047b3889723))
* add import for characters ([673ad26](https://github.com/eXaminator/kanka-foundry/commit/673ad267e51e21aac1913e9de9958257ea844bc7))
* add import for event entities ([69f80f3](https://github.com/eXaminator/kanka-foundry/commit/69f80f370f726fe6f3b236d39cccc2015d41aed5))
* add import for families ([0286e97](https://github.com/eXaminator/kanka-foundry/commit/0286e97301cd06adfe17a228bab2fe2d22e5def7))
* add import for item entities ([8a0c97c](https://github.com/eXaminator/kanka-foundry/commit/8a0c97ca9680d575a0ad193cc7483f4f68c46e17))
* add import for journal entities ([f89d4c9](https://github.com/eXaminator/kanka-foundry/commit/f89d4c989ab77e4fc5ef5de7071731a92a52e61f))
* add import for quest entities ([154805f](https://github.com/eXaminator/kanka-foundry/commit/154805f0728fe722351a4928d01b233d808dcacb))
* add import for races ([447c5ab](https://github.com/eXaminator/kanka-foundry/commit/447c5ab34506344dbe1cac3fa94441e83adb0b3a))
* add notifications for expired tokens ([8d149fc](https://github.com/eXaminator/kanka-foundry/commit/8d149fcec00b693a980c416da8e5a003c30aad26)), closes [#14](https://github.com/eXaminator/kanka-foundry/issues/14)
* add proper campaign selection to module settings ([8732493](https://github.com/eXaminator/kanka-foundry/commit/87324931d9b23879b88fe6fb6d61b2ee016fdb81))
* add quest references to meta data ([9b2d79e](https://github.com/eXaminator/kanka-foundry/commit/9b2d79e9d6f24b92703468e73a7cea0e97ee60ae)), closes [#15](https://github.com/eXaminator/kanka-foundry/issues/15)
* add setting to hide private entities ([112b7d2](https://github.com/eXaminator/kanka-foundry/commit/112b7d27e52f7df97d7577718c3551c6dc53e57c)), closes [#8](https://github.com/eXaminator/kanka-foundry/issues/8)
* add settings to enable/disable import of certain types ([2ac2edb](https://github.com/eXaminator/kanka-foundry/commit/2ac2edbc9448d42bef3aaa7d9bb0c122ca2bf502)), closes [#16](https://github.com/eXaminator/kanka-foundry/issues/16)
* add support for note entities ([a33fbe0](https://github.com/eXaminator/kanka-foundry/commit/a33fbe08e8a092e6561e1691d45641f6b807d999))
* add support for organisation entities ([ea8b782](https://github.com/eXaminator/kanka-foundry/commit/ea8b782e1a8ad3cdceba852773ca5b893b86e10c))
* defer entity list loading after template render ([de11f7c](https://github.com/eXaminator/kanka-foundry/commit/de11f7cc1663d6f5c106706ab53939dcdd871596)), closes [#18](https://github.com/eXaminator/kanka-foundry/issues/18)
* display attributes and additional meta data in journal entries ([749b90a](https://github.com/eXaminator/kanka-foundry/commit/749b90aef802e71db9d58bfaafef771120dbef6e))
* display sections for meta data ([62f14fc](https://github.com/eXaminator/kanka-foundry/commit/62f14fce9d93535b189a15cfb16162d60b5e4c07))
* handle kanka mention links ([5451e60](https://github.com/eXaminator/kanka-foundry/commit/5451e6001e850269f757376d4917b044c2309fbc))
* hide empty entity type lists ([ac710a5](https://github.com/eXaminator/kanka-foundry/commit/ac710a59811709340f053efb11837f9ce1a66262))
* improve entity list styles ([efc9f79](https://github.com/eXaminator/kanka-foundry/commit/efc9f79852434207639cee235cccd244162c3bbe))
* improve entity list styling ([be641ce](https://github.com/eXaminator/kanka-foundry/commit/be641ceaee384ff92137930749c11d858b8a9de5))
* remember collapsible status in local storage ([718cea6](https://github.com/eXaminator/kanka-foundry/commit/718cea6e0d465dc28618c33710b676b8ed4eb3ce)), closes [#1](https://github.com/eXaminator/kanka-foundry/issues/1)
* **journal:** add location sync ([4d3977e](https://github.com/eXaminator/kanka-foundry/commit/4d3977ecc3df7f76a0a9e0ddce41e6a405a49e21))
* initial commit ([8e5b82b](https://github.com/eXaminator/kanka-foundry/commit/8e5b82bb66cf35dbc544302309f4bbcc58be622f))
