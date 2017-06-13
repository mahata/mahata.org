+++
date = "2017-06-13T19:16:35+09:00"
draft = false
title = "Ruby 2.0 (or later) の CoW"

+++

[Working With Unix Processes](https://www.amazon.co.jp/exec/obidos/ASIN/B0078VSRUE/96c11b31f45ff807-22/ref=nosim/) を読んでいる。

これによると、Ruby (MRI) では 2.0 まで CoW (Copy on Write) が実装されていなかったそうだ。理由は Ruby の GC がナイーブなマーク・アンド・スイープであったから、らしい。

バージョン 1.9 までの Ruby は、マークのタイミングでオブジェクト内に直接「使用中」フラグを立てていたそうだ。つまり、オブジェクトに変更を加えることになるので、このタイミングでオブジェクトのコピーが発生してしまう。

バージョン 2.0 からは、マーク・アンド・スイープのために専用のメモリ領域をつくるので、マークのタイミングでオブジェクト自身を変更する必要はない。これなら CoW を機能させることができる。

なるほどなあ。