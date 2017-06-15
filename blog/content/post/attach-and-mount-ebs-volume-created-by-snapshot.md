+++
date = "2017-06-15T20:43:11+09:00"
draft = false
title = "スナップショットから作成した EBS ボリュームをマウントする"

+++

この記事では EBS ボリュームのスナップショットを、新しい EC2 インスタンスでマウントする方法について記述する。すでに EBS ボリュームのスナップショットは作成されていると仮定する。まだであれば、[ひとつ前の記事](/post/create-ebs-snapshot/)を参照してほしい。

AWS コンソールでぽちぽちと新しい EC2 インスタンスを作成し、途中の "Add Storage" のプロセスで `/dev/sdf` 辺りに前述の記事で作成したスナップショットIDを使ってボリュームを追加するとしよう。

最終的に作成されたインスタンスに ssh でログインし、`lsblk` を実行すると次のように表示される。ブロックデバイスは認識されているものの、マウントされていないことがわかる。

```
## /dev/xvdf はアタッチされているが、マウントされていない (MOUNTPOINT が空)
## (lsblk の NAME は "/dev/" が省略される)
$ lsblk
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
xvda    202:0    0    8G  0 disk
└─xvda1 202:1    0    8G  0 part /
xvdf    202:80   0  512G  0 disk

## ちなみに xvdf は /dev/sdf のエイリアス
$ ls -l /dev/sdf
lrwxrwxrwx 1 root root 4 Jun 14 08:16 /dev/sdf -> xvdf

## /dev/xvdf にファイルシステムは存在することを確認する (ない場合は mkfs を使う)
$ sudo file -s /dev/xvdf
/dev/xvdf: Linux rev 1.0 ext4 filesystem data, UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (needs journal recovery) (extents) (large files) (huge files)
```

マウントするためには、次の順で作業をすればよい。

1. マウントポイントを作成する (今回の例では `/data/mydata` をマウントポイントとする)
2. `/etc/fstab` を変更する
3. `mount -a` で `/etc/fstab` の内容を反映する

具体的には、こうだ。

```
## マウントポイントを作成する
$ sudo mkdir -p /data/mydata

## (再起動でリセットされない) 永続的なマウントを実現するため /etc/fstab を変更
$ sudo cp /etc/fstab /etc/fstab.orig
$ sudo vi /etc/fstab  # (次の行を追加: `/dev/xvdf /data/mydata ext4 defaults,nofail 0 2`)

## /etc/fstab の内容を反映する
$ sudo mount -a
```

`/etc/fstab` に書けるオプションは正直なところ、かなりややこしい。AWS オフィシャルのドキュメントに次のようにある。

> (/etc/fstab の) この行の最後の 3 つのフィールドは、ファイルシステムのマウントオプション、ファイルシステムのダンプ頻度、起動時に実行されるファイルシステムチェックの順番です。これらの値がわからない場合は、例の値 (defaults,nofail 0 2) を使用してください。

素直に「例の値 `(defaults,nofail 0 2)`」を採用しても多くの場合は問題ないだろう。

## 参考記事

* [Amazon EBS ボリュームを使用できるようにする - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ebs-using-volumes.html)
