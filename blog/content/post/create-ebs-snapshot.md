+++
date = "2017-06-15T20:08:07+09:00"
draft = false
title = "AWS CLI で EBS のスナップショットを作成する"

+++

この記事は AWS CLI で EBS のスナップショットを作成するためのメモだ。

正直なところ、何も難しいことはない。ボリューム ID が "vol-xxxxxxxx" の EBS ボリュームのバックアップを取るなら `aws ec2 create-snapshot --volume-id vol-xxxxxxxx --description "My Backup"` とすればいいだけだ。

ただし、`create-snapshot` はオプションが少なく、スナップショットの作成と同時にタグ付ができない。例えば、スナップショットの Name タグを "MySnapshot" とし、Cost を タグを "MyService" としたければ、`create-tags` コマンドを別に叩く必要がある。

`create-snapshot` は作成するスナップショットの情報を JSON で STDOUT に出力する。この JSON にはスナップショット ID の情報も含まれているので、次のようにすることで目的の処理を達成できる。

```
$ SnapshotId=$(aws ec2 create-snapshot --volume-id vol-xxxxxxx --description "MySnapshot") | jq -r .SnapshotId)
$ aws ec2 create-tags --resources $SnapshotId --tags Key=Cost,Value=MyService Key=Name,Value=MySnapshot
```

なお、AWS では EBS ボリュームのスナップショットを連続で作成した場合、後から作られるスナップショットは前回のスナップショットからの増分スナップショットになる。
