# JLPT N5 Dokkai (読解) Practice Questions

102 questions covering the Dokkai (reading comprehension) section of the JLPT N5. The Dokkai section tests reading comprehension across short narrative passages, medium connected paragraphs, and information-retrieval texts (notices, menus, schedules).

## Subtypes covered

| Mondai | Subtype | Length | Layout | Questions |
|---|---|---|---|---|
| Mondai 4 | 内容理解 短文 (short passage) | ~80-150 chars | 1-2 questions per passage | 30 passages, 60 Qs |
| Mondai 5 | 内容理解 中文 (medium passage) | ~250-300 chars | 2-3 questions per passage | 10 passages, 30 Qs |
| Mondai 6 | 情報検索 (information retrieval) | notice / menu / schedule | 2 questions per item | 6 items, 12 Qs |

## Notation rules

- Each passage is shown in a blockquote (`>`) so it visually mirrors the test paper.
- Questions follow each passage. Choices are numbered 1-4. **Answer**: shows the correct number.
- Passages use predominantly N5-syllabus kanji and N5 vocabulary. **Naturalness exception (formalized 2026-05-02):** authentic JLPT N5 reading passages routinely use a small number of common non-N5 kanji where forcing kana would harm readability. The full exception list is machine-tracked in `data/dokkai_kanji_exception.json` and currently covers: 京, 作, 使, 図, 院, 回, 教, 楽, 病, 終, 自, 阪, 館, 黒, 犬, 妹, 家, 弁, 当, 思, 朝, 近, 紙, 青, 同. JA-28 (in `tools/check_content_integrity.py`) enforces that `data/papers/dokkai/*.json` cannot introduce non-N5 kanji outside this list without explicit documentation. Bunpou / moji / goi stay strictly N5.
- **Question-stem kanji policy (formalized 2026-05-01):** question stems may reuse any non-N5 kanji that already appears in the passage they reference, so the question phrasing stays parallel to the source text (e.g., a passage that uses 妹 may have a stem `この 人の 妹は 何を べんきょうしますか。`). Standalone non-N5 kanji that are NOT present in the corresponding passage are forbidden in stems and must be written in kana.
- Distractor choices may contain non-N5 vocabulary where authentic JLPT distractor variety requires it (see header note in `moji_questions_n5.md` for the kanji-scope exception applied to question files).
- No em dashes (U+2014) appear in this file.

## Sources

Format and several passage themes are modeled on authentic samples from `learnjapaneseaz.com/jlpt/jlpt-n5` and the official `jlpt.jp` sample set. Original passages adapted to use only N5 vocabulary.

## Engine display note

For mock-test mode, the app's test engine MUST hide the `**Answer:**` line and rationale until the student commits an answer. The visible-by-default format here is for self-study reference; runtime test rendering is the engine's responsibility.

## Numeral convention

Numbers are written using both kanji forms (一, 二, 三, 五, 十, 百, 千) and arabic numerals (1, 2, 100, 1000) - mirroring authentic JLPT papers, which use kanji numerals in narrative text and arabic numerals in prices, addresses, schedules, and time tables. This is intentional, not inconsistency.

---

## Mondai 4 - 内容理解 短文 (Short Passage Comprehension)

30 short passages, ~80-150 characters each, 1-2 comprehension questions each. Total 60 questions.

### Passage 1 (Q1, Q2)

> わたしは 一か月 まえに インドから 日本に （　　）。 友だちの 家に いましたが、 きのう アパートに ひっこしました。 きょう プレゼントを もって となりの 人に あいさつに 行きました。 となりの 人が 「さいきん ひっこしの あいさつに 来る 人が すくなく なった」 と 言いました。

#### Q1

（　　）に 入れる ことばは どれが いちばん よいですか。

_The blank should be filled with:_

1. 来ます
2. 来ません
3. 来ました
4. 来ませんでした

**Answer: 3** - past affirmative (came one month ago).

#### Q2

この 人は いま どこに すんでいますか。

1. インド (India)
2. 友だちの 家
3. となりの 家
4. アパート

**Answer: 4** - moved to the apartment yesterday.

### Passage 2 (Q3, Q4)

> きのうは 母の 日だったので、 1,000えん もって 花や に 行きました。 きれいな 花が たくさん ありました。 一本 100えんの カーネーションを 三本 買ってから、 ケーキやで 120えんの ケーキを 四つ 買いました。 おかあさんは とても よろこびました。

#### Q3

おかねは いくら のこって いますか。

_How much money does the writer have left?_

1. 20えん
2. 120えん
3. 220えん
4. 320えん

**Answer: 3** - 1000 - (100×3) - (120×4) = 1000 - 300 - 480 = 220.

#### Q4

この 人は だれの ために これを 買いましたか。

_Who did the writer buy these things for?_

1. 友だち
2. お父さん
3. お母さん
4. じぶん

**Answer: 3** - "Mother's Day" + おかあさんがよろこんだ.

### Passage 3 (Q5, Q6)

> たなかさんへ
>
> こんにちは。 あした こうえんで パーティーが あります。 三時から はじまります。 たなかさんも 来て ください。 おかしと のみものは ありますから、 もって 来なくても いいです。 でも、 さむくなりましたから、 コートを もって 来て ください。
>
> やまだ

#### Q5

やまださんは たなかさんに 何を もって 来てと 言いましたか。

_What does Yamada-san ask Tanaka-san to bring?_

1. おかし
2. のみもの
3. コート
4. 何も もって 来なくて いい

**Answer: 3** - explicitly asks for a coat.

#### Q6

パーティーは 何時に はじまりますか。

_What time does the party start?_

1. 一時
2. 二時
3. 三時
4. 四時

**Answer: 3** - 三時からはじまります.

### Passage 4 (Q7, Q8)

> 私の しゅみは 本を よむ ことです。 一しゅうかんに 三さつ よみます。 すきな 本は ぜんぶ 日本ごの 本です。 むずかしい 本も ありますが、 じしょを ひきながら ゆっくり よみます。 本やで 本を 買うのも すきですが、 図書館で かりる ことが おおいです。

#### Q7

この 人は 一しゅうかんに 本を 何さつ よみますか。

_How many books does the writer read in a week?_

1. 一さつ
2. 二さつ
3. 三さつ
4. 四さつ

**Answer: 3** - 一しゅうかんに 三さつ よみます.

#### Q8

この 人は ふつう どこで 本を 手に いれますか。

_Where does the writer usually get books?_

1. 本やで 買う
2. 友だちから かりる
3. 図書館で かりる
4. 学校で かりる

**Answer: 3** - 図書館でかりることがおおい.

### Passage 5 (Q9, Q10)

> こんしゅう、 友だちが 日本に 来ます。 友だちは 日本ごが よく わかりません。 ですから わたしが 駅まで むかえに 行きます。 駅で あってから、 いっしょに ホテルに 行きます。 ばんごはんは いえで 食べる つもりです。 おすしを 作ります。

#### Q9

この 人は さいしょに 何を しますか。

1. ホテルに 行く
2. ばんごはんを 食べる
3. 駅で 友だちに あう
4. おすしを 作る

**Answer: 3** - first action is meeting at station.

#### Q10

ばんごはんに 何を 食べますか。

1. レストランの りょうり
2. ホテルの りょうり
3. いえで 作った おすし
4. 友だちが もって きた もの

**Answer: 3** - いえで作るおすし.

### Passage 6 (Q11, Q12)

> やまださんへ
>
> きのう、 学校で しゅくだいの 紙を わすれて しまいました。 すみませんが、 あした わたしの 家に 来る まえに きょうしつから 紙を とって 来て くれませんか。 ロッカーの 中に あります。 ロッカーの ばんごうは 七です。
>
> たなか

#### Q11

たなかさんは やまださんに 何を して と たのみましたか。

_What does Tanaka-san want Yamada-san to do?_

1. しゅくだいを 作って くれる
2. 紙を きょうしつから とって くる
3. 学校に 行って くれる
4. ロッカーを あける

**Answer: 2**.

#### Q12

ロッカーの ばんごうは いくつですか。

_The locker number is:_

1. 五
2. 六
3. 七
4. 八

**Answer: 3**.

### Passage 7 (Q13, Q14)

> わたしは 毎あさ こうえんを さんぽします。 こうえんで いつも 同じ おじいさんに あいます。 おじいさんは いぬを つれて います。 いぬは 白くて、 とても 大きいです。 おじいさんは いつも 「おはよう」 と 言います。 わたしも 「おはようございます」 と こたえます。

#### Q13

この 人は 毎あさ 何を しますか。

_What does the writer do every morning?_

1. いぬと さんぽする
2. こうえんを さんぽする
3. おじいさんと さんぽする
4. 学校に 行く

**Answer: 2**.

#### Q14

いぬは どんな いぬですか。

_What is the dog like?_

1. 白くて、ちいさい
2. 白くて、大きい
3. 黒くて、大きい
4. 黒くて、ちいさい

**Answer: 2** - 白くて、とても大きい.

### Passage 8 (Q15, Q16)

> あしたは 私の たんじょうびです。 友だちが パーティーを ひらいて くれます。 ともだちは みんな 八時に 来ます。 私は おかしと ジュースを 買いに 行きます。 ケーキは 友だちが 作って もって 来ます。 とても たのしみです。

#### Q15

だれが ケーキを 作りますか。

_Who is making the cake?_

1. わたし
2. 友だち
3. お母さん
4. みせの 人

**Answer: 2**.

#### Q16

パーティーは 何時に はじまりますか。

_What time does the party begin?_

1. 七時
2. 七時 半
3. 八時
4. 八時 半

**Answer: 3**.

### Passage 9 (Q17, Q18)

> こんしゅう、 私は とても いそがしかったです。 月曜日と 火曜日は 学校で テストが ありました。 水曜日は 病院に 行きました。 木曜日と 金曜日は アルバイトを しました。 にちようびに やっと やすめます。

#### Q17

この 人は 何曜日に いそがしくなかったですか。

_Which day was the writer NOT busy?_

1. 月曜日
2. 水曜日
3. 金曜日
4. 日曜日

**Answer: 4** - finally rests on Sunday.

#### Q18

水曜日に この 人は 何を しましたか。

_What did the writer do on Wednesday?_

1. テストを うけた
2. 病院に 行った
3. アルバイトを した
4. やすんだ

**Answer: 2**.

### Passage 10 (Q19, Q20)

> たなかさんへ
>
> 来週の 土曜日、 みんなで 山に のぼりに 行きませんか。 朝 七時に 駅に あつまります。 弁当と 水を じぶんで もって 来て ください。 さむいですから、 あたたかい ふくも わすれないで ください。 行きたい 人は、 私に 電話して ください。
>
> やまだ

#### Q19

やまださんは みんなに 何を して と 言いましたか。

_What does Yamada-san want everyone to do?_

1. 山の しゃしんを とる
2. やまだの いえに 来る
3. 山に のぼる
4. 駅で あさごはんを 食べる

**Answer: 3**.

#### Q20

みんなは 何を もって 来ますか。

_What should participants bring?_

1. ケーキ と コーヒー
2. 弁当 と 水 と あたたかい ふく
3. 何も もって 行かなくて いい
4. ふく と お金

**Answer: 2**.

### Passage 11 (Q21, Q22)

> 私の 父は 学校の 先生です。 子どもが すきですから、 毎日 学校に 行くのが 楽しいと 言って います。 母は 病院で はたらいて います。 父も 母も しごとで いそがしいですが、 日曜日は いつも 家に いて、 私と あそびます。

#### Q21

この 人の おかあさんは どこで はたらいて いますか。

_Where does the writer's mother work?_

1. 学校
2. 病院
3. みせ
4. レストラン

**Answer: 2**.

#### Q22

この 人の りょうしんは 日よう日に 何を しますか。

_What do the writer's parents do on Sundays?_

1. はたらく
2. 山に 行く
3. 家で 子どもと あそぶ
4. ねる

**Answer: 3**.

### Passage 12 (Q23, Q24)

> あさ おきて、 まどを あけました。 きのうの よる、 たくさん 雨が ふりましたが、 きょうは 天気が とても いいです。 そらは 青くて、 きれいな 花が さいて います。 きょうは こうえんで お弁当を 食べる つもりです。

#### Q23

きのうの よる、 てんきは どうでしたか。

_What was the weather like last night?_

1. はれ
2. くもり
3. 雨
4. ゆき

**Answer: 3**.

#### Q24

この 人は きょう 何を しますか。

_What will the writer do today?_

1. 家で ねる
2. 学校に 行く
3. こうえんで お弁当を 食べる
4. 雨の 中を さんぽする

**Answer: 3**.

### Passage 13 (Q25, Q26)

> 私は えいごの じゅぎょうが すきです。 先生は アメリカ人で、 とても しんせつです。 むずかしい もんだいでも、 先生に 聞けば、 ていねいに おしえて くれます。 私は 先生に なりたいので、 たくさん べんきょうして います。

#### Q25

この 人は 何が すきですか。

_What does the writer like?_

1. アメリカの 国
2. えいごの じゅぎょう
3. しゅくだい
4. アメリカ人の 友だち

**Answer: 2**.

#### Q26

この 人は 何に なりたいですか。

_What does the writer want to be?_

1. アメリカ人
2. 学生
3. 先生
4. いしゃ

**Answer: 3** - 先生になりたい.

### Passage 14 (Q27, Q28)

> たなかさんは 毎あさ 七時に おきて、 八時の 電車に のります。 しごとは 九時から はじまります。 家から かいしゃまで 一時間 ぐらい かかります。 ばんごはんは いつも かいしゃの ちかくの レストランで 食べます。 家に かえるのは 十時ごろです。

#### Q27

たなかさんは かいしゃまで どのぐらい かかりますか。

_How long does it take Tanaka-san to get to work?_

1. 三十分
2. 四十五分
3. 一時間
4. 二時間

**Answer: 3** - passage says 「一時間ぐらい」.

#### Q28

たなかさんは どこで ばんごはんを 食べますか。

_Where does Tanaka-san eat dinner?_

1. 家
2. かいしゃ
3. かいしゃの ちかくの レストラン
4. 駅の 近く

**Answer: 3**.

### Passage 15 (Q29, Q30)

> 私の いえには 大きい 犬が 一ぴき います。 名前は シロです。 白い 犬ですから、 シロです。 シロは 五さいです。 とても げんきで、 子どもが 大すきです。 私の おとうとと いっしょに よく あそびます。

#### Q29

シロは 何さいですか。

_How old is Shiro?_

1. 一さい
2. 三さい
3. 五さい
4. 七さい

**Answer: 3**.

#### Q30

どうして いぬの 名前は 「シロ」ですか。

_Why is the dog called "Shiro"?_

1. 大きいから
2. 子どもが すきだから
3. 白い 犬だから
4. げんきだから

**Answer: 3**.

### Passage 16 (Q31, Q32)

> やまださんは おんがくが すきです。 まいばん、 ねる まえに 一時間 ピアノを ひきます。 にちようびは 友だちの 家に 行って、 いっしょに ピアノを ひきます。 こんしゅうの どようび、 がっこうで コンサートが あります。 やまださんも ひきます。

#### Q31

やまださんは いつ 一人で ピアノを ひきますか。

_When does Yamada-san play piano alone?_

1. あさ
2. ひる
3. ばん (ねるまえ)
4. ねた あと

**Answer: 3**.

#### Q32

こんしゅうの コンサートは どこで ありますか。

_Where is the concert this week?_

1. 友だちの 家
2. やまださんの 家
3. 学校
4. こうえん

**Answer: 3**.

### Passage 17 (Q33, Q34)

> こんしゅうの 日曜日に、 友だち と えいがを 見に 行きます。 えいがは 三時から 五時まで です。 えいがの まえに、 ひるごはんを 食べる つもりです。 えいがが 終わったら、 こうちゃの きっさてんで すこし 話します。

#### Q33

えいがは 何時に はじまりますか。

_What time does the movie start?_

1. 一時
2. 二時
3. 三時
4. 五時

**Answer: 3**.

#### Q34

えいがの あとで この 人は 何を しますか。

_What will the writer do AFTER the movie?_

1. ひるごはんを 食べる
2. 家に かえる
3. きっさてんで 話す
4. もう 一かい えいがを 見る

**Answer: 3**.

### Passage 18 (Q35, Q36)

> 私の 父は 中国語が じょうずです。 父は 大学生の とき、 中国に すんで いました。 父は 私にも 中国語を 教えて くれます。 でも、 中国語は とても むずかしいですから、 私は あまり 上手では ありません。

#### Q35

どうして この 人の おとうさんは 中国語が じょうず ですか。

_Why is the writer's father good at Chinese?_

1. 父は 中国人 だから
2. 大学で べんきょうしたから
3. 中国に すんで いたから
4. 先生 だから

**Answer: 3**.

#### Q36

この 人の 中国語は どうですか。

_How is the writer's Chinese?_

1. とても じょうず
2. すこし 上手
3. あまり 上手では ない
4. ぜんぜん わからない

**Answer: 3**.

### Passage 19 (Q37, Q38)

> 私の 学校には プールが あります。 月曜日と 水曜日と 金曜日に プールに 入れます。 日曜日は 学校が 休みですから、 プールも 使えません。 私は およぐのが すきですから、 一しゅうかんに 三回 プールに 行きます。

#### Q37

この 人は どのぐらい プールに 行きますか。

_How often does the writer go to the pool?_

1. 一しゅうかんに 一回
2. 一しゅうかんに 二回
3. 一しゅうかんに 三回
4. 毎日

**Answer: 3**.

#### Q38

プールが つかえない 日は いつですか。

_When can the writer NOT use the pool?_

1. 月曜日
2. 水曜日
3. 金曜日
4. 日曜日

**Answer: 4**.

### Passage 20 (Q39, Q40)

> たなかさんは 朝ごはんに いつも パンと ぎゅうにゅうを 食べます。 でも きょうは パンが ありませんでした。 ですから、 ごはんを 食べました。 ぎゅうにゅうの かわりに、 おちゃを のみました。 きょうの 朝ごはんは いつもと ちがいました。

#### Q39

たなかさんは けさ 何を 食べましたか。

_What did Tanaka-san eat this morning?_

1. パン と ぎゅうにゅう
2. パン と おちゃ
3. ごはん と ぎゅうにゅう
4. ごはん と おちゃ

**Answer: 4**.

#### Q40

どうして きょうの 朝ごはんは いつもと ちがいましたか。

_Why was breakfast different today?_

1. ごはんが なかったから
2. ぎゅうにゅうが きらいだから
3. パンが なかったから
4. 朝ごはんを 食べなかったから

**Answer: 3**.

### Passage 21 (Q41, Q42)

> こんしゅうの 火曜日、 友だちの たんじょうびです。 友だちは おいしい おかしが すきですから、 ケーキを かおうと 思います。 でも、 大きい ケーキは 高いです。 ちいさい ケーキを 三つ かいます。

#### Q41

ともだちの たんじょうびは いつですか。

_When is the friend's birthday?_

1. 月曜日
2. 火曜日
3. 水曜日
4. 木曜日

**Answer: 2**.

#### Q42

どうして この 人は 大きい ケーキを 買いませんか。

_Why doesn't the writer buy a big cake?_

1. ちいさい ほうが おいしいから
2. 大きい ケーキは 高いから
3. 友だちが ちいさい ケーキの ほうが すきだから
4. ケーキやが ちかいから

**Answer: 2**.

### Passage 22 (Q43, Q44)

> 私の 妹は 来年の 四月、 大学に 入ります。 妹は 日本語を べんきょうしたいです。 私たちの 家は 大学から とおいですから、 妹は 大学の ちかくの アパートに ひっこします。 さびしくなりますが、 妹が がんばるのを おうえんします。

#### Q43

この 人の 妹は 何を べんきょうしますか。

_What will the writer's sister study?_

1. えいご
2. 中国語
3. 日本語
4. ピアノ

**Answer: 3**.

#### Q44

どうして 妹は ひっこしますか。

_Why is the sister moving?_

1. 大学が とおいから
2. 大学が ちかいから
3. 友だちと いっしょに すみたいから
4. アパートが すきだから

**Answer: 1**.

### Passage 23 (Q45, Q46)

> 私の しゅみは しゃしんを とる ことです。 まいしゅう カメラを もって、 こうえんや 山に 行きます。 はなや 木や そらの しゃしんを とります。 とった しゃしんは 友だちに 見せます。 友だちも 「きれいだ」と 言います。

#### Q45

この 人の しゅみは 何ですか。

_What is the writer's hobby?_

1. え を かく こと
2. しゃしんを とる こと
3. 山に のぼる こと
4. 友だちと あそぶ こと

**Answer: 2**.

#### Q46

この 人は 何の しゃしんを とりますか。

_What does the writer photograph?_

1. 友だち
2. 家
3. はな、木、そら
4. 子ども

**Answer: 3**.

### Passage 24 (Q47, Q48)

> やまださんは あした 大阪に しゅっちょうします。 あさ 七時の しんかんせんに のります。 大阪から 東京に かえるのは あさっての よるです。 にもつは ちいさい かばんと スーツケースが 一つです。 あした 朝 はやいので、 きょうは はやく ねます。

#### Q47

やまださんは いつ 大阪へ 出ますか。

_When does Yamada-san leave for Osaka?_

1. きょうの 朝
2. きょうの よる
3. あしたの 朝
4. あしたの よる

**Answer: 3**.

#### Q48

やまださんは いつ とうきょうに かえりますか。

_When does Yamada-san return to Tokyo?_

1. あしたの 朝
2. あしたの よる
3. あさっての 朝
4. あさっての よる

**Answer: 4**.

### Passage 25 (Q49, Q50)

> 私の 父は 毎日 八時に 家を 出ます。 でんしゃで かいしゃに 行きます。 でんしゃは とても こんで います。 ですから 父は いつも 立って います。 かいしゃまで 一時間 ぐらい かかります。 父は 「つかれる」と 言います。

#### Q49

おとうさんは 何で かいしゃに 行きますか。

_How does the father go to work?_

1. くるま
2. でんしゃ
3. バス
4. 自てん車

**Answer: 2**.

#### Q50

どうして おとうさんは 「つかれる」と 言いますか。

_Why does the father say "I get tired"?_

1. しごとが むずかしいから
2. でんしゃで 立って いるから
3. かいしゃが ちかいから
4. 朝 はやく おきるから

**Answer: 2**.

### Passage 26 (Q51, Q52)

> 私の あには ピアノが じょうずです。 五さいから ピアノを ならって います。 こんしゅう、 大学の コンサートで ひきます。 家ぞくは みんな 見に 行きます。 私も 朝から 楽しみに して います。

#### Q51

あには 何さいから ピアノを ならって いますか。

_From what age has the older brother been learning piano?_

1. 三さいから
2. 四さいから
3. 五さいから
4. 六さいから

**Answer: 3** - passage says 「五さいから ピアノを ならって います」.

#### Q52

こんしゅう 何が ありますか。

_What is happening this week?_

1. たんじょうびの パーティー
2. 大学の コンサート
3. ピアノの レッスン
4. 家ぞくの しょくじ

**Answer: 2**.

### Passage 27 (Q53, Q54)

> たなかさんは 朝ごはんを 食べる 時間が ありません。 まい朝、 でんしゃの 中で パンを 食べます。 でも きょうは でんしゃが こんで いて、 パンを 食べる ことが できませんでした。 きょうの ひるごはんは いつもより たくさん 食べました。

#### Q53

たなかさんは ふつう どこで 朝ごはんを 食べますか。

_Where does Tanaka-san usually eat breakfast?_

1. 家
2. かいしゃ
3. でんしゃの 中
4. みせ

**Answer: 3**.

#### Q54

どうして たなかさんは きょう ひるごはんを たくさん 食べましたか。

_Why did Tanaka-san eat more lunch today?_

1. ひるごはんが おいしかったから
2. パンが きらいだから
3. 朝ごはんを 食べなかったから
4. やすかったから

**Answer: 3**.

### Passage 28 (Q55, Q56)

> 私の 友だちの じょんさんは アメリカ人です。 でも 日本ごが とても じょうずです。 五年 まえに 日本に 来ました。 いま 日本の かいしゃで はたらいて います。 じょんさんと よく いっしょに 日本ごの 本を 読みます。

#### Q55

じょんさんは いま 何を して いますか。

_What does John-san do now?_

1. 学校で べんきょうする
2. 日本の かいしゃで はたらく
3. アメリカに かえる
4. 日本ごを 教える

**Answer: 2**.

#### Q56

じょんさんは 何年 日本に いますか。

_How long has John-san been in Japan?_

1. 一年
2. 三年
3. 五年
4. 十年

**Answer: 3**.

### Passage 29 (Q57, Q58)

> 私は きのう、 駅の ちかくの あたらしい きっさてんに 行きました。 その みせは 三月に できました。 コーヒーが おいしくて、 ねだんも 安いです。 きっさてんは いつも こんで います。 こんどは 友だちと いっしょに 行きたいです。

#### Q57

きっさてんは いつ できましたか。

_When did the cafe open?_

1. 一月
2. 二月
3. 三月
4. 四月

**Answer: 3**.

#### Q58

どうして この 人は 友だちと もう一どに 行きたいですか。

_Why does the writer want to go again with friends?_

1. 友だちが すきだから
2. コーヒーが おいしくて、ねだんも 安いから
3. ちかいから
4. 友だちが はたらいて いるから

**Answer: 2**.

### Passage 30 (Q59, Q60)

> やまださんは こんしゅうの 土曜日、 たなかさんと いっしょに ハイキングに 行く つもりでした。 でも、 木曜日から 雨が ふって います。 土曜日も 雨の よほうです。 ですから、 ハイキングは らいしゅうに します。 たなかさんも 「らいしゅうの ほうが いい」と 言いました。

#### Q59

はじめ、ハイキングは いつでしたか。

_When was the hiking originally planned?_

1. 木曜日
2. 金曜日
3. 土曜日
4. 日曜日

**Answer: 3**.

#### Q60

どうして ハイキングは 後の 日に なりましたか。

_Why was the hiking postponed?_

1. たなかさんが いそがしいから
2. 雨が ふるから
3. 山が とおいから
4. やまださんが びょうき だから

**Answer: 2**.

---

## Mondai 5 - 内容理解 中文 (Medium Passage Comprehension)

10 medium-length passages (~250-300 chars), 3 questions each. Total 30 questions.

### Passage A (Q61-Q63)

> 私は こうこうせいの ときから 日本に きょうみが ありました。 父が 日本ごの 先生でしたから、 子どもの ときから 日本ごを すこし べんきょうしました。 大学に 入ってから、 日本ごを もっと まじめに べんきょうしました。 大学の 二年生の とき、 はじめて 日本に 来ました。 一しゅうかん だけでしたが、 日本が 大すきに なりました。 来年、 大学を そつぎょうしてから、 日本に すんで しごとを するつもりです。 母は すこし さびしいと 言いますが、 私の ゆめを おうえんして くれます。

#### Q61

この 人は どうして 日本語の べんきょうを はじめましたか。

1. 大学で べんきょうした
2. 子どもの とき、父から 教わった
3. 日本に 来てから べんきょうした
4. 友だちが 教えて くれた

**Answer: 2** - 子どもの ときから + 父が 先生.

#### Q62

この 人は いつ はじめて 日本に 来ましたか。

1. 子どもの とき
2. 高校生の とき
3. 大学 二年生の とき
4. 大学を そつぎょうした あと

**Answer: 3**.

#### Q63

この 人は そつぎょうした 後、何を しますか。

1. 大学いんに 入る
2. 日本に すんで しごとを する
3. 父と いっしょに 先生に なる
4. 母と すむ

**Answer: 2**.

### Passage B (Q64-Q66)

> やまださんは 二十さいの 大学生です。 ちいさい ときから ピアノが だいすきです。 ピアノを ならいはじめたのは、 五さいの ときです。 はじめは あまり じょうずでは ありませんでした。 でも、 まいにち れんしゅうしました。 中学校に 入った とき、 ピアノの コンサートに 出ました。 たくさんの 人の まえで ひくのは こわかったですが、 とても いい けいけんでした。 いまは ともだちに ピアノを 教えて います。 ピアノで 友だちが ふえました。 やまださんは 「ピアノを はじめて よかった」と 言って います。

#### Q64

やまださんは いつ ピアノを はじめましたか。

1. 二さい
2. 五さい
3. 中学校に 入ってから
4. 大学に 入ってから

**Answer: 2**.

#### Q65

やまださんの はじめての コンサートは どうでしたか。

1. たのしかった
2. つまらなかった
3. こわかったが、いい けいけんだった
4. むずかしかった

**Answer: 3**.

#### Q66

やまださんは いま 何を していますか。

1. ピアノを ならって いる
2. ピアノを 教えて いる
3. ピアノを 売って いる
4. ピアノを 作って いる

**Answer: 2**.

### Passage C (Q67-Q69)

> 私の 母は りょうりが とても じょうずです。 母の 作る りょうりは ぜんぶ おいしいですが、 私が いちばん すきなのは カレーです。 母の カレーは ふつうの カレーとは ちがいます。 中に やさいが たくさん 入って います。 にくは すこし だけです。 でも、 とても おいしいです。 こんど、 母から カレーの 作りかたを 教わって、 友だちに 作って あげたいです。 友だちも きっと よろこぶと 思います。

#### Q67

この 人の おかあさんは 何が じょうずですか。

1. ピアノ
2. りょうり
3. しごと
4. うた

**Answer: 2**.

#### Q68

おかあさんの カレーは どんな ところが ちがいますか。

_What is special about the mother's curry?_

1. 高い
2. ピリ辛い
3. やさいが たくさん、にくは すこし
4. ふつうの カレー

**Answer: 3**.

#### Q69

この 人は これから 何を する つもりですか。

_What does the writer plan to do?_

1. 母に カレーを 作って もらう
2. レストランで カレーを 食べる
3. カレーの 作りかたを ならって、友だちに 作って あげる
4. カレーやで はたらく

**Answer: 3**.

### Passage D (Q70-Q72)

> 私の 家は 駅から あるいて 十五分 かかります。 あさ 八時の でんしゃに のりたいですから、 七時 四十分に 家を 出ます。 でも きょうは ねぼうして しまいました。 家を 出たのは 七時 五十分でした。 いそいで あるきましたが、 八時の でんしゃには まに あいませんでした。 つぎの でんしゃは 八時 十分でした。 駅で 十分 まちました。 八時 十分の でんしゃに のれましたが、 かいしゃに つくのは いつもより おそかったです。

#### Q70

この 人の 家から 駅まで あるいて 何分 かかりますか。

_How long does it take from the writer's house to the station on foot?_

1. 五分
2. 十分
3. 十五分
4. 二十分

**Answer: 3**.

#### Q71

この 人は 今日 何時に 家を 出ましたか。

_What time did the writer leave home today?_

1. 七時 四十分
2. 七時 四十五分
3. 七時 五十分
4. 八時

**Answer: 3**.

#### Q72

この 人は どの でんしゃに のりましたか。

_Which train did the writer catch?_

1. 七時 五十分の でんしゃ
2. 八時の でんしゃ
3. 八時 十分の でんしゃ
4. でんしゃに のれなかった

**Answer: 3**.

### Passage E (Q73-Q75)

> 来月、 私の たんじょうびです。 友だちの たなかさんが パーティーを ひらいて くれます。 ばしょは たなかさんの 家です。 友だちが 八人 来る よていです。 私は たんじょうびに 何が ほしいか 友だちに 聞かれましたが、 「何も いらない」と こたえました。 でも 父と 母には、 新しい カメラが ほしいと 言いました。 ふるい カメラは 五年 つかって いますが、 もう こわれそうです。 父は 「いっしょに 買いに 行こう」と 言いました。

#### Q73

たんじょうびの パーティーは どこで ありますか。

_Where will the birthday party be?_

1. 私の 家
2. 友だちの 家 (たなかさんの 家)
3. レストラン
4. こうえん

**Answer: 2**.

#### Q74

何人の 友だちが 来ますか。

_How many friends will come?_

1. 五人
2. 六人
3. 七人
4. 八人

**Answer: 4**.

#### Q75

この 人は たんじょうびに 何が ほしいですか。

_What does the writer want for a birthday gift?_

1. 何も いらない
2. ふるい カメラ
3. 新しい カメラ
4. ケーキ

**Answer: 3** - 父と母には「カメラがほしい」と言った.

### Passage F (Q76-Q78)

> 日本で いちばん 高い 山は ふじさんです。 三七七六メートル あります。 ふじさんは とても きれいですから、 たくさんの 人が 見に 行きます。 のぼる ことも できますが、 のぼるのは 七月と 八月の 二か月 だけです。 ほかの 月は ゆきが おおいですから、 のぼれません。 私は ことしの 八月、 はじめて ふじさんに のぼりました。 とても つかれましたが、 上から 見た けしきは とても きれいでした。

#### Q76

何か月 ふじさんに のぼる ことが できますか。

_How many months can people climb Mt. Fuji?_

1. 一か月
2. 二か月
3. 三か月
4. 四か月

**Answer: 2**.

#### Q77

この 人は いつ ふじさんに のぼりましたか。

_When did the writer climb Mt. Fuji?_

1. 七月
2. 八月
3. 九月
4. 十月

**Answer: 2**.

#### Q78

けいけんは どうでしたか。

_How was the experience?_

1. たのしくて、らくだった
2. つまらなかった
3. つかれたが、けしきが きれいだった
4. ふじさんに のぼれなかった

**Answer: 3**.

### Passage G (Q79-Q81)

> こんしゅうの 日曜日、 たなかさんは 友だちと いっしょに うみへ 行きます。 朝 六時に 駅で あつまります。 でんしゃで うみまで 一時間 はん かかります。 うみで およいだり、 さかなを 見たり する つもりです。 ひるごはんは うみの ちかくの レストランで 食べます。 三時ごろ うみを 出て、 五時に 家に かえる よていです。 たなかさんは 「うみが だいすきだから、 たのしみだ」と 言って います。

#### Q79

たなかさんは 何時に 友だちと あいますか。

_What time will Tanaka-san meet friends?_

1. 五時
2. 六時
3. 七時
4. 八時

**Answer: 2**.

#### Q80

うみまで 何分 かかりますか。

_How long does it take to get to the sea?_

1. 三十分
2. 一時間
3. 一時間 はん
4. 二時間

**Answer: 3**.

#### Q81

ひるごはんは どこで 食べますか。

_Where will they have lunch?_

1. 駅の ちかく
2. うみの ちかくの レストラン
3. 家
4. でんしゃの 中

**Answer: 2**.

### Passage H (Q82-Q84)

> 私の あには ことし 三十さいに なりました。 二年 まえに けっこんしました。 おくさんは 私の 学校の 先生でした。 とても しんせつな 人です。 来月、 二人の あいだに 子どもが 生まれます。 私は おばに なります。 はじめての おばだから、 とても うれしいです。 母も 父も よろこんで います。 母は 「子どもが 生まれたら、 まいしゅう 会いに 行く」と 言って います。

#### Q82

この 人の あには いま 何さいですか。

_How old is the writer's older brother now?_

1. 二十さい
2. 二十五さい
3. 三十さい
4. 三十二さい

**Answer: 3**.

#### Q83

あにの おくさんの しごとは 何でしたか。

_What was the older brother's wife's job?_

1. かいしゃいんでした
2. いしゃでした
3. 学校の 先生でした
4. ピアノの 先生でした

**Answer: 3** - passage uses past tense でした; answer matches.

#### Q84

来月 何が ありますか。

_What will happen next month?_

1. あにが けっこんする
2. 子どもが 生まれる
3. 父が 五十さいに なる
4. 母が しごとを やめる

**Answer: 2**.

### Passage I (Q85-Q87)

> 私は ねこが 大すきです。 でも 私の 家には ねこは いません。 父が 「ねこは よわいから、 ねこを 家で かう ことは できない」と 言いました。 私の 友だちの たなかさんの 家には ねこが 三びき います。 私は よく たなかさんの 家に 行って、 ねこと あそびます。 ねこは みんな 名前が あります。 黒い ねこは クロ、 白い ねこは シロ、 ちゃいろの ねこは チャです。 みんな かわいいです。

#### Q85

どうして この 人の 家に ねこは いませんか。

_Why doesn't the writer have a cat?_

1. ねこが きらいだから
2. 父が 「よわいから」と 言ったから
3. 家が ちいさいから
4. ねこが 高いから

**Answer: 2**.

#### Q86

たなかさんの 家には ねこが 何びき いますか。

_How many cats does Tanaka-san's family have?_

1. いっぴき
2. にひき
3. さんびき
4. よんひき

**Answer: 3** - passage says ねこが 三びき います (three cats).

#### Q87

ちゃいろの ねこの 名前は 何ですか。

_What is the brown cat's name?_

1. クロ
2. シロ
3. チャ
4. 名前は ない

**Answer: 3**.

### Passage J (Q88-Q90)

> 私の 妹は ちいさい ときから 本を 読むのが すきでした。 まいばん ねる まえに、 一じかん ぐらい 本を 読みます。 妹の へやには 本が いっぱい あります。 妹は とくに 子ども向けの 本が すきです。 大きく なってからも、 子ども向けの 本を よく 読みます。 「子ども向けの 本は きれいで、 やさしくて、 たのしい」と 言って います。 来月、 妹は 子ども向けの 本を 書きはじめる つもりです。 きっと いい 本に なると 思います。

#### Q88

この 人の 妹は いつ 本を よみますか。

_When does the writer's sister read books?_

1. 朝
2. ひる
3. ねる まえ
4. しょくじの まえ

**Answer: 3**.

#### Q89

妹は どんな 本が いちばん すきですか。

_What kind of books does she like best?_

1. むずかしい 本
2. 子ども向けの 本
3. しんぶん
4. ざっし

**Answer: 2**.

#### Q90

妹は 来月 何を しますか。

_What will she do next month?_

1. 大学に 入る
2. 子ども向けの 本を 書きはじめる
3. ひっこしする
4. 学校で 本を 教える

**Answer: 2**.

---

## Mondai 6 - 情報検索 (Information Retrieval)

6 information items (notice / menu / schedule / map). 2 questions per item, 12 questions total.

### Item 1 (Q91, Q92): こうえんの あんない

> 中央こうえんの あんない
>
> | こうえんの 中で できる こと | 時間 | お金 |
> |---|---|---|
> | プールで およぐ | 9:00 - 18:00 | 大人 500円 / 子ども 200円 |
> | テニス | 10:00 - 20:00 | 一時間 600円 |
> | じてん車を かりる | 9:00 - 17:00 | 一時間 300円 |
> | バーベキュー | 11:00 - 16:00 | 一人 1,000円 (よやくが いります) |

#### Q91

子どもが プールで およぐと いくらに なりますか。

_A child wants to swim in the pool. How much will it cost?_

1. 200円
2. 300円
3. 500円
4. 1,000円

**Answer: 1**.

#### Q92

よやくが いる ものは どれですか。

_What activity requires a reservation?_

1. プール
2. テニス
3. じてん車
4. バーベキュー

**Answer: 4**.

### Item 2 (Q93, Q94): えいごの きょうしつの ポスター

> あたらしい えいごの きょうしつ
>
> ばしょ:  中央えき から あるいて 五分
>
> 時間: 月よう日 と 水よう日 の 7:00pm - 9:00pm
>
> ねだん: 一か月 12,000円
>
> 先生: アメリカから 来た スミス先生
>
> 大人だけの きょうしつです。 こうこうせいは 入れません。
>
> もうしこみは でんわ で 03-1234-5678 まで。

#### Q93

じゅぎょうは いつ ありますか。

_When can students attend the class?_

1. 月よう日 と 火よう日
2. 月よう日 と 水よう日
3. 火よう日 と 木よう日
4. 毎日

**Answer: 2**.

#### Q94

この きょうしつに 入れない 人は どれですか。

_Who CANNOT join this class?_

1. かいしゃいん
2. しゅふ (housewife)
3. こうこうせい
4. 大学生

**Answer: 3** - 大人だけ + こうこうせいは入れない.

### Item 3 (Q95, Q96): レストランの メニュー

> サクラ レストラン メニュー
>
> | りょうり | ねだん | のみもの 付き |
> |---|---|---|
> | カレー | 800円 | + 200円 |
> | ラーメン | 700円 | + 200円 |
> | サンドイッチ セット | 600円 | のみもの 付き |
> | ハンバーガー セット | 900円 | のみもの と サラダ 付き |
>
> ランチタイム (11:00 - 14:00) は ぜんぶ 100円 やすい。

#### Q95

たなかさんは 12:30に カレーと のみものを たのみました。 いくら はらいますか。

_Tanaka-san orders curry with a drink at 12:30pm. How much does Tanaka-san pay?_

1. 700円
2. 800円
3. 900円
4. 1,000円

**Answer: 3** - カレー 800 + のみもの 200 - ランチタイム わりびき 100 = 900円.

#### Q96

のみものと サラダが つく セットは どれですか。

_Which set comes with both a drink and a salad?_

1. カレー
2. ラーメン
3. サンドイッチ セット
4. ハンバーガー セット

**Answer: 4**.

### Item 4 (Q97, Q98): バスの じこくひょう

> 中央えき から こうえん 行き バス
>
> | 月よう日 ～ 金よう日 | 土よう日・日よう日 |
> |---|---|
> | 7:00, 7:30, 8:00, 8:30, 9:00 | 8:00, 9:00, 10:00 |
> | 17:00, 17:30, 18:00, 18:30 | 16:00, 17:00, 18:00 |
> | (ひるは 一時間に 一本) | (ひるは 二時間に 一本) |
>
> こうえんに つくのは バスが 出てから 二十分 ぐらいです。

#### Q97

月よう日、 9:30まで に こうえんに つきたいです。 どの バスに のれば いいですか。

_The writer wants to arrive at the park by 9:30 on Monday. Which bus should they take?_

1. 7:00 の バス
2. 8:30 の バス
3. 9:00 の バス
4. 10:00 の バス

**Answer: 3** - 9:00 + 20 min = 9:20, arrives before 9:30.

#### Q98

日よう日の 朝、 バスは どのぐらいの 時間に 一本 ありますか。

_On Sunday morning, how often do buses run?_

1. 三十分に 一本
2. 一時間に 一本
3. 二時間に 一本
4. 一日に 一本

**Answer: 2** - 8:00, 9:00, 10:00 = hourly.

### Item 5 (Q99, Q100): びょういんの あんない

> こころ びょういん
>
> | か | じかん |
> |---|---|
> | ないか | 月～金 9:00-12:00, 14:00-17:00 |
> | しか | 月、水、金 14:00-19:00 |
> | みみの か | 火、木 10:00-15:00 |
>
> 土よう日と 日よう日は おやすみです。

#### Q99

水曜日に しかは 何時から 何時まで あいて いますか。

_What time is the dentist (しか) open on Wednesday?_

1. 9:00 から 12:00 まで
2. 14:00 から 19:00 まで
3. 10:00 から 15:00 まで
4. 9:00 から 17:00 まで

**Answer: 2** - しか on 月、水、金 14:00-19:00.

#### Q100

みみの かに 行きたいです。 何曜日に 行きますか。

_A patient needs to see an ear doctor (みみの か). Which day can they go?_

1. 月曜日
2. 水曜日
3. 木曜日
4. 土曜日

**Answer: 3** - みみの か opens 火、木; only 木曜日 is in the options.

### Item 6 (Q101, Q102): 学校の あんない

> ABC日本ご学校
>
> はじまる 時間: 9:00
>
> おわる 時間: 15:00
>
> ひるの きゅうけい: 12:00 - 13:00
>
> 月よう日 ～ 金よう日 まで じゅぎょうが あります。
>
> どようびと 日よう日は 学校が やすみです。
>
> やすみの 日に 図書館を つかいたい 人は、 先生に 言って ください。

#### Q101

ひるの きゅうけいは どのぐらい ですか。

_How long is the lunch break?_

1. 三十分
2. 一時間
3. 一時間 はん
4. 二時間

**Answer: 2** - 12:00 to 13:00.

#### Q102

日よう日に 図書館を つかいたい とき、 どう しますか。

_A student wants to use the library on Sunday. What should they do?_

1. 学校に 来て 図書館を つかう
2. 先生に 言う
3. 土ようびに 来る
4. 図書館は つかえない

**Answer: 2** - notice says tell the teacher in advance (give notice / request use).

---

## End of file

100 questions complete:
- Mondai 4 (短文): 30 passages, 60 questions
- Mondai 5 (中文): 10 passages, 30 questions
- Mondai 6 (情報検索): 6 items, 10 questions

This concludes the four-file question bank series:

1. `moji_questions_n5.md` (100 Qs)
2. `goi_questions_n5.md` (100 Qs)
3. `bunpou_questions_n5.md` (100 Qs)
4. `dokkai_questions_n5.md` (100 Qs)

Total: **400 questions** across all four JLPT N5 written-test sections.

Next steps tracked under `TASKS.md` Phase 2.9 (W1-W5): convert these MD banks into `data/questions.json` entries with a `category` field, update the test-engine UI to filter by category, and run lint over the imported set.


<!-- 2026-05-03 audit §2.2: dokkai_kanji_exception.json extended with 向, 央, 付 (see WHY notes in that file). -->
