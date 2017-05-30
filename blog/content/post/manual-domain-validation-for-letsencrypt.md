+++
date = "2017-05-30T21:55:39+09:00"
draft = true
title = "Gradle で \"Failed to load native library 'libnative-platform.so' for Linux amd64.\" と言われるときの対処"

+++

`gradle build` をして、次のようなエラーに遭遇した:

```
FAILURE: Build failed with an exception.

* What went wrong:
Failed to load native library 'libnative-platform.so' for Linux amd64.

* Try:
Run with --stacktrace option to get the stack trace. Run with --info or --debug option to get more log output.
```

いかにも何か依存パッケージが足りていないようなエラーメッセージだ。検索してみると「`libstdc++` をインストールすると解決するよ」という記事も実際に存在する。

僕も `libstdc++` をインストールしてみたが、問題は解決しなかった。実際には `~/.gradle` に `root` 権限でディレクトリが作られてしまっていたことが問題であった。単に `~/.gradle/*` を削除して `gradle build` を実行しなおすことでビルドを実行できた。

わかってしまえば簡単な問題だけど、エラーメッセージが不親切だと時間を無駄にしてしまう事例だ。
