
var options = {
    parser:V8ResultsParser,
    output:"table.tex",
    files:[],
    ratios:[],
    abrv:{},
};

for (var i = 0; i < arguments.length; ++i) {
    var arg = arguments[i];
    if (arg === "-v8") {
        options.parser = V8ResultsParser;
    } else if (arg === "-sunspider") {
        options.parser = SunSpiderResultsParser;
    } else if (arg === "--ratio") {
        var ratio = arguments[++i].split("/");
        options.ratios.push(ratio);
    } else if (arg === "--abrv") {
        var abrv = arguments[++i].split("=");
        options.abrv[abrv[0]] = abrv[1];
    } else {
        options.files.push(arg);
    }
}

function getAbrv(name) {
    return (options.abrv[name] !== undefined) ? options.abrv[name] : name;    
}

var results = {};
var names = [];

for (var i = 0; i < options.files.length; ++i) {
    var fileName = options.files[i];
    var path = fileName.split(".")[0].split("/");
    var name = path[path.length - 1];

    results[name] = eval(options.parser.matchAll(readFile(fileName), "topLevel")); 
    names.push(name);
}

names = names.concat(options.ratios);

var scores = names.map(function () { return 1; });
var benchmarkNb = 0;
for (var benchmark in results[names[0]].benchmarks) { benchmarkNb++; }

print("\\begin{tabular}{|" + ["l"].concat(names.map(function () { return "r"; })).join("|") + "|}")
print("  \\hline");
print("  " + ["Benchmark"].concat(names.map(function (name) {
    if (typeof name === "string") 
        return getAbrv(name); 
    else 
        return getAbrv(name[0]) + "/" + getAbrv(name[1]);
})).join(" & ") + " \\\\");
print("  \\hline \\hline");
for (var benchmark in results[names[0]].benchmarks) {
    print("  " + [benchmark].concat(names.map(function (name, i) { 
        if (typeof name === "string") 
            var r =  results[name].benchmarks[benchmark].toFixed(1); 
        else 
            var r = (results[name[0]].benchmarks[benchmark] / results[name[1]].benchmarks[benchmark]).toFixed(1);

        scores[i] *= r;
        return r;
    })).join(" & ") + "\\\\"); 
    print("  \\hline");
}

    print("  \\hline");
    print("  " + [(options.parser === V8ResultsParser ? "V8" : "SunSpider") +" Score"].concat(names.map(function (name) { 
        if (typeof name === "string")
            return results[name].score.toFixed(1); 
        else 
            return (results[name[0]].score / results[name[1]].score).toFixed(1);
    })).join(" & ") + "\\\\"); 

    if (options.parser !== V8ResultsParser) { 
        print("  " + ["Geometric Mean"].concat(scores.map(function (score) { 
            return Math.pow(score, 1/(benchmarkNb)).toFixed(1); 
        })).join(" & ") + "\\\\");
    }
    print("  \\hline");
print("\\end{tabular}");

