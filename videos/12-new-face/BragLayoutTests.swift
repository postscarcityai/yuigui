import XCTest

/// Scenes for the 0.4.x layout video (SOC-6, yuigui videos/12-new-face). Like
/// `YuiPromoTests`, each test plays a scripted scene on the demo account while the
/// simulator is recorded, and writes the moments the edit cuts on (epoch seconds)
/// to `YUI_CLIPS/<name>.json`. No network, no real account: the agent's replies
/// and the voice are scripted. Skipped unless `YUI_CLIPS` is set.
@MainActor
final class BragLayoutTests: XCTestCase {
    private var app: XCUIApplication!
    private var clip = ""
    private var marks: [String: Double] = [:]

    override func setUpWithError() throws {
        continueAfterFailure = true
        try XCTSkipIf(ProcessInfo.processInfo.environment["YUI_CLIPS"] == nil, "set YUI_CLIPS to record brag scenes")
    }

    static let latest = [
        "say \"Yes. Build 208, the newest.\"",
        "shapes w=10 h=6 caption=\"Your iPad is on 204. Update it in TestFlight.\"",
        "shape@p box \"iPhone 208\" at=3,3 size=3,4 tone=mint +fill +grow",
        "shape@i box \"iPad 204\" at=7.4,3 size=3.6,3 tone=mute +dash",
    ].joined(separator: "\\n")

    static let shipIt = [
        "say \"0.4.2 is building. On TestFlight in about 40 minutes.\"",
        "shapes w=12 h=6 caption=\"Build, checks, TestFlight. You get a ping when it lands.\"",
        "shape@b box Build at=2,3 +fill +pulse",
        "shape arrow from=b to=c",
        "shape@c box Checks at=6,3 +dash",
        "shape arrow from=c to=t",
        "shape@t pill TestFlight at=10,3 size=3.2,1.4 tone=mint +dash",
        "say \"The tuner and the metronome ride along.\"",
        "shapes w=12 h=7 caption=\"Tune up, keep time, then send a take.\"",
        "shape box E at=1.5,2.6 size=1.3,3.6 +fill",
        "shape box A at=3,2.6 size=1.3,3.6 tone=mute",
        "shape box D at=4.5,2.6 size=1.3,3.6 +fill",
        "shape pill \"96 BPM\" at=6,6 size=5,1.2 tone=mint +fill +grow",
        "say \"Ableton Link waits for the next one.\"",
        "sketch \"In 0.4.2\" frame=window",
        "row \"Tuner\" +hi",
        "row \"Metronome\" +hi",
        "row \"Ableton Link\" +x note=\"next time\"",
        "plan@before \"Before I go\" submit=Send",
        "choose@ping \"Ping you when it lands?\" \"Yes, ping me\"|\"Only if it breaks\"",
        "choose@try \"What do you want to try first?\" Tuner|Metronome|Keys",
        "end",
    ].joined(separator: "\\n")

    static let dryDay = [
        "say \"Tuesday at 10 is dry. Wind under 8.\"",
        "shapes w=12 h=6 caption=\"Rain until Monday night, clear from Tuesday.\"",
        "shape@m box Mon at=2,3 tone=mute +dash",
        "shape@t box Tue at=6,3 tone=mint +fill +grow",
        "shape@w box Wed at=10,3 tone=mint +fill",
    ].joined(separator: "\\n")

    /// Unquoted: a launch argument that starts with a quote is read as a plist string.
    static let dryDoing = "Checking the forecast 1/3|Drafting the plan 2/3|Found a dry window 3/3"

    // MARK: Scenes

    /// Hold the big mic and talk; one question, one screen back.
    func testBragTalk() {
        launch("brag-talk", agent: "yui", appearance: "light", reply: Self.latest, extra: [
            "-yuiPTTFake", "Am I on the latest build?", "-yuiDemoPickupAfter", "0.5", "-yuiDemoReplyAfter", "3.6",
            "-yuiDemoDoing", "Checking TestFlight 1/2|Asking your devices 2/2",
        ])
        let mic = app.buttons["stage-mic"]
        _ = mic.waitForExistence(timeout: 20)
        sleep(2)
        mark("start")
        sleep(2)
        mark("mic")
        mic.press(forDuration: 2.4)
        _ = app.descendants(matching: .any)["stage-you"].firstMatch.waitForExistence(timeout: 10)
        mark("sent")
        _ = line("Yes. Build 208").waitForExistence(timeout: 15)
        mark("answer")
        sleep(4)
        cut()
    }

    /// A longer answer plays in parts; the questions wait for the end with one Send;
    /// the chat is the record, top right.
    func testBragParts() {
        launch("brag-parts", agent: "yui", appearance: "light", reply: Self.shipIt, extra: [
            "-yuiPTTFake", "Ship the music tools to TestFlight", "-yuiDemoPickupAfter", "0.5", "-yuiDemoReplyAfter", "3.2",
            "-yuiDemoDoing", "Starting the 0.4.2 release 1/2|Checking what is ready 2/2",
        ])
        let mic = app.buttons["stage-mic"]
        _ = mic.waitForExistence(timeout: 20)
        sleep(2)
        mark("start")
        sleep(1)
        mark("mic")
        mic.press(forDuration: 2.4)
        _ = line("0.4.2 is building").waitForExistence(timeout: 20)
        mark("part1")
        sleep(3)
        mark("next1")
        tap(app.buttons["stage-next"], pause: 3)
        mark("next2")
        tap(app.buttons["stage-next"], pause: 3)
        mark("next3")
        tap(app.buttons["stage-next"], pause: 2)
        mark("ping")
        tap(app.buttons["Yes, ping me"], pause: 1)
        mark("try")
        tap(app.buttons["Tuner"], pause: 1)
        mark("send")
        tap(app.buttons["stage-send"], pause: 3)
        mark("record")
        tap(app.buttons["stage-record"], pause: 3)
        mark("row")
        let row = app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "The tuner and the metronome")).firstMatch
        tap(row, wait: 3, pause: 3)
        cut()
    }

    /// The same turn on two agents: each moves its own way.
    func testBragMotionCoach() { motion("brag-motion-coach", agent: "coach", look: nil) }
    func testBragMotionWizard() {
        motion("brag-motion-wizard", agent: "wizard", look: "pace=quick ease=heavy enter=drop pulse=beat")
    }

    /// The picture behind the words moves with your voice.
    func testBragVisualVoice() {
        launch("brag-visual-voice", agent: "yui", appearance: "dark", reply: "say Done.", extra: [
            "-yuiDemoVisual", "aurora", "-yuiPTTDemo", "Is my morning free tomorrow?",
        ])
        _ = app.descendants(matching: .any)["stage-first"].waitForExistence(timeout: 20)
        sleep(1)
        mark("start")
        sleep(7)
        cut(hold: 0)
    }

    /// And with the music: a beat on the stage, the waves move with it.
    func testBragVisualMusic() {
        launch("brag-visual-music", agent: "coach", appearance: "dark",
               reply: #"visual waves react=music\nloop 96 "Boom bap" p=x...x.x.|....x...|..x...x.|xxxxxxxx"#, extra: [
            "-yuiPTTFake", "Give me a beat", "-yuiDemoPickupAfter", "0.5", "-yuiDemoReplyAfter", "1.5",
        ])
        let mic = app.buttons["stage-mic"]
        _ = mic.waitForExistence(timeout: 20)
        sleep(1)
        mark("start")
        sleep(1)
        mark("mic")
        mic.press(forDuration: 2.4)
        let play = app.buttons["loop-play"]
        _ = play.waitForExistence(timeout: 25)
        sleep(2)
        mark("play")
        play.tap()
        sleep(8)
        cut(hold: 0)
    }

    // MARK: Helpers

    private func motion(_ name: String, agent: String, look: String?) {
        var extra = ["-yuiDemoPickupAfter", "0.6", "-yuiDemoReplyAfter", "7", "-yuiDemoDoing", Self.dryDoing,
                     "-yuiPTTFake", "Find me a dry day to fly the drone"]
        if let look { extra += ["-yuiDemoLook", look] }
        launch(name, agent: agent, appearance: "light", reply: Self.dryDay, extra: extra)
        let mic = app.buttons["stage-mic"]
        _ = mic.waitForExistence(timeout: 20)
        sleep(1)
        mark("start")
        sleep(1)
        mark("mic")
        mic.press(forDuration: 2.4)
        _ = line("Tuesday at 10").waitForExistence(timeout: 20)
        mark("answer")
        sleep(4)
        cut(hold: 0)
    }

    private func launch(_ name: String, agent: String, appearance: String, reply: String, extra: [String]) {
        clip = name
        marks = [:]
        app = XCUIApplication()
        app.launchArguments = ["-yuiStageFirst", "YES", "-yuiDemoAccount", "-yuiDemoAgents", "-yuiAgent", agent,
                               "-appearance", appearance, "-yuiDemoReply", reply] + extra
        app.launch()
    }

    private func mark(_ key: String) { marks[key] = Date.now.timeIntervalSince1970 }

    /// Holds the last frame, then writes the marks.
    private func cut(hold: UInt32 = 2) {
        sleep(hold)
        mark("end")
        let dir = URL(fileURLWithPath: ProcessInfo.processInfo.environment["YUI_CLIPS"]!)
        try? JSONSerialization.data(withJSONObject: marks).write(to: dir.appending(path: "\(clip).json"))
    }

    private func tap(_ e: XCUIElement, wait: TimeInterval = 10, pause: UInt32 = 1) {
        guard e.waitForExistence(timeout: wait) else { return }
        // The questions screen can report the top bar as not hittable; tap its center anyway.
        if e.isHittable { e.tap() } else { e.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap() }
        sleep(pause)
    }

    private func line(_ prefix: String) -> XCUIElement {
        app.staticTexts.matching(NSPredicate(format: "identifier == 'stage-line' AND label BEGINSWITH %@", prefix)).firstMatch
    }
}
