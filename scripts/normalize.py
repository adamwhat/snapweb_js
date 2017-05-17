import numpy as np
from sklearn.preprocessing import StandardScaler

files = ["../data/occluder.obj", "../data/flowers1.obj", "../data/flowers2.obj"]
out_files = ["../data/occluder_n.obj", "../data/flowers1_n.obj", "../data/flowers2_n.obj"]

print_idx = [
    (27, 1382, "left eye center"),
    (32, 3536, "right eye center"),
    (62, 533, "nose tip"),
    (44, 711, "left mouth corner"),
    (50, 2870, "left mouth corner"),
    (20, 1872, "left eyebrow towards center"),
    (16, 4064, "right eyebrow towards center")
  ]

d = {}
for fname in files:
    with open(fname, "rb") as f:
        d[fname] = []
        for line in f:
            if not line.startswith("v "): continue
            d[fname].append([float(v) for v in line.split(" ")[1:]])
    d[fname] = np.array(d[fname])

for fname in files:
    print np.average(d[fname], axis=0)

ss = StandardScaler().fit(d[files[0]])
print ss.mean_, ss.std_

for fname in files:
    d[fname] = ss.transform(d[fname])
    print np.average(d[fname], axis=0)

for fname, outname in zip(files, out_files):
    buf = []
    with open(fname, "rb") as f:
        c = 0
        for line in f:
            if not line.startswith("v "):
                buf.append(line)
                continue
            row = d[fname][c]
            buf.append("v %.4f %.4f %.4f\n" % (row[0], row[1], row[2]))
            c += 1
    with open(outname, "wb") as fout:
        fout.writelines(buf)

for (clm_id, mesh_id, comment) in print_idx:
    print "%d: [%.4f, %.4f, %.4f], // %s, %d" % (
            clm_id,
            d[files[0]][mesh_id][0],
            d[files[0]][mesh_id][1],
            d[files[0]][mesh_id][2],
            comment,
            mesh_id
    )
